import { useState, useEffect } from 'react';
import * as nifti from 'nifti-reader-js';

const MNI2MM = { x0: 90, y0: -126, z0: -72, vx: 2, vy: 2, vz: 2 };

function asTypedArray(header, buffer) {
  switch (header.datatypeCode) {
    case nifti.NIFTI1.TYPE_INT8:    return new Int8Array(buffer);
    case nifti.NIFTI1.TYPE_UINT8:   return new Uint8Array(buffer);
    case nifti.NIFTI1.TYPE_INT16:   return new Int16Array(buffer);
    case nifti.NIFTI1.TYPE_UINT16:  return new Uint16Array(buffer);
    case nifti.NIFTI1.TYPE_INT32:   return new Int32Array(buffer);
    case nifti.NIFTI1.TYPE_UINT32:  return new Uint32Array(buffer);
    case nifti.NIFTI1.TYPE_FLOAT32: return new Float32Array(buffer);
    case nifti.NIFTI1.TYPE_FLOAT64: return new Float64Array(buffer);
    default: return new Float32Array(buffer);
  }
}

function minmax(arr) {
  let mn = Infinity, mx = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v < mn) mn = v;
    if (v > mx) mx = v;
  }
  return [mn, mx];
}

async function loadNifti(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`GET ${url} → ${res.status} ${t}`);
  }
  let ab = await res.arrayBuffer();
  if (nifti.isCompressed(ab)) ab = nifti.decompress(ab);
  if (!nifti.isNIFTI(ab)) throw new Error('not a NIfTI file');
  const header = nifti.readHeader(ab);
  const image = nifti.readImage(header, ab);
  const ta = asTypedArray(header, image);
  let f32;
  if (ta instanceof Float32Array) f32 = ta;
  else if (ta instanceof Float64Array) f32 = Float32Array.from(ta);
  else {
    const [mn, mx] = minmax(ta);
    const range = (mx - mn) || 1;
    f32 = new Float32Array(ta.length);
    for (let i = 0; i < ta.length; i++) f32[i] = (ta[i] - mn) / range;
  }
  const nx = header.dims[1] | 0;
  const ny = header.dims[2] | 0;
  const nz = header.dims[3] | 0;
  if (!nx || !ny || !nz) throw new Error('invalid dims');
  const [mn, mx] = minmax(f32);
  const vx = Math.abs(header.pixDims?.[1] ?? 1);
  const vy = Math.abs(header.pixDims?.[2] ?? 1);
  const vz = Math.abs(header.pixDims?.[3] ?? 1);
  return { data: f32, dims: [nx, ny, nz], voxelMM: [vx, vy, vz], min: mn, max: mx };
}

export function useNiftiData(url) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError('');

    loadNifti(url)
      .then(result => {
        if (mounted) {
          setData(result);
          setError('');
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message);
          setData(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [url]);

  return { data, loading, error };
}

export function isStandardMNI2mm(dims, voxelMM) {
  const okDims = Array.isArray(dims) && dims[0] === 91 && dims[1] === 109 && dims[2] === 91;
  const okSp = voxelMM && Math.abs(voxelMM[0] - 2) < 1e-3 && Math.abs(voxelMM[1] - 2) < 1e-3 && Math.abs(voxelMM[2] - 2) < 1e-3;
  return okDims && okSp;
}

export function coord2idx(c_mm, n, axis, dims, voxelMM) {
  const [nx, ny, nz] = dims;
  const [vx, vy, vz] = voxelMM;
  const isStd = isStandardMNI2mm([nx, ny, nz], [vx, vy, vz]);

  if (isStd) {
    let v;
    if (axis === 'x') v = ((MNI2MM.x0 - c_mm) / MNI2MM.vx);
    else if (axis === 'y') v = ((c_mm - MNI2MM.y0) / MNI2MM.vy);
    else v = ((c_mm - MNI2MM.z0) / MNI2MM.vz);
    const idx = Math.round(v);
    return Math.max(0, Math.min(n - 1, idx));
  }

  const mmPerVoxel = axis === 'x' ? vx : axis === 'y' ? vy : vz;
  const sign = axis === 'x' ? -1 : 1;
  const v = (sign * (c_mm / mmPerVoxel)) + Math.floor(n / 2);
  const idx = Math.round(v);
  return Math.max(0, Math.min(n - 1, idx));
}