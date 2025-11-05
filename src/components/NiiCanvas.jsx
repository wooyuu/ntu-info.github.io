import { useEffect, useRef } from 'react';

export function NiiCanvas({
  width,
  height,
  data,
  dims,
  bgData,
  threshold,
  overlayAlpha,
  posOnly,
  useAbs,
  crosshairs,
  onClick
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dims || !data) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    const imageData = ctx.createImageData(width, height);

    const alpha = Math.max(0, Math.min(1, overlayAlpha));
    const [R, G, B] = [255, 0, 0]; // Red overlay color

    // Background normalization
    const bgMin = bgData?.min ?? 0;
    const bgMax = bgData?.max ?? 1;
    const bgRange = (bgMax - bgMin) || 1;

    let p = 0;
    for (let y = 0; y < height; y++) {
      const srcY = height - 1 - y; // Vertical flip
      for (let x = 0; x < width; x++) {
        // Draw background
        let gray = 0;
        if (bgData) {
          const vbg = bgData[x + srcY * width];
          let g = (vbg - bgMin) / bgRange;
          g = Math.max(0, Math.min(1, g));
          gray = (g * 255) | 0;
        }

        imageData.data[p] = gray;
        imageData.data[p + 1] = gray;
        imageData.data[p + 2] = gray;
        imageData.data[p + 3] = 255;

        // Overlay map
        if (data) {
          let mv = data[x + srcY * width];
          const raw = mv;
          if (useAbs) mv = Math.abs(mv);
          let pass = threshold == null ? (mv > 0) : (mv >= threshold);
          if (posOnly && raw <= 0) pass = false;
          if (pass) {
            imageData.data[p] = ((1 - alpha) * imageData.data[p] + alpha * R) | 0;
            imageData.data[p + 1] = ((1 - alpha) * imageData.data[p + 1] + alpha * G) | 0;
            imageData.data[p + 2] = ((1 - alpha) * imageData.data[p + 2] + alpha * B) | 0;
          }
        }
        p += 4;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw crosshairs
    if (crosshairs) {
      const { x, y } = crosshairs;
      ctx.save();
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();

      // Horizontal line
      const screenY = height - 1 - y;
      ctx.beginPath();
      ctx.moveTo(0, screenY + 0.5);
      ctx.lineTo(width, screenY + 0.5);
      ctx.stroke();
      ctx.restore();
    }
  }, [width, height, data, dims, bgData, threshold, overlayAlpha, posOnly, useAbs, crosshairs]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={onClick}
      style={{ cursor: 'crosshair', width: '100%', height: '100%' }}
      className="rounded-xl border"
    />
  );
}