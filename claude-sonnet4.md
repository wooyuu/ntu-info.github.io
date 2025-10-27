# Neurosynth API 專案開發問答集

## 專案背景

**Q: 這個專案的目標是什麼？**

A: 開發一個基於 Neurosynth 資料庫的功能分離查詢工具，可以分析大腦不同區域在不同認知功能上的激活差異。主要功能包括：
- 透過術語（terms）查詢功能分離
- 透過大腦座標查詢功能分離
- 提供網頁介面方便使用

---

## API 架構設計

**Q: 後端 API 的核心功能有哪些？**

A: 主要有三個核心端點：
1. `/dissociate/terms/{termA}/{termB}` - 比較兩個術語的功能分離
2. `/dissociate/locations/{locationA}/{locationB}` - 比較兩個座標位置的功能分離
3. `/terms` - 列出所有可用的術語

**Q: 如何處理座標格式？**

A: 座標使用下底線分隔的 MNI 格式，例如：
- `0_-52_26` 表示座標 (x=0, y=-52, z=26)
- 在 URL 中傳遞時會自動編碼和解析

**Q: 什麼是功能分離（dissociation）？**

A: 功能分離分析比較兩個大腦區域或認知功能的激活模式差異，幫助識別：
- 哪些功能在區域 A 更活躍（A > B）
- 哪些功能在區域 B 更活躍（B > A）
- 兩者的特異性和共同性

---

## 部署配置

**Q: 推薦使用什麼平台部署後端？**

A: 推薦使用 **Render.com**，優點包括：
- 免費方案支援 Python/Flask
- 自動從 GitHub 部署
- 提供 HTTPS
- 配置簡單

部署步驟：
1. 在 Render 上創建 Web Service
2. 連接 GitHub repository
3. 設定：Runtime = Python 3，Build Command = `pip install -r requirements.txt`，Start Command = `gunicorn app:app`
4. 自動部署完成

**Q: 需要哪些配置檔案？**

A: 主要需要三個檔案：
- `requirements.txt` - Python 依賴套件
- `render.yaml` - Render 部署配置（可選）
- `app.py` - Flask 應用程式

---

## 前端整合

**Q: 如何在 GitHub Pages 上部署前端？**

A: 兩種方式：

**方式 1：直接在 repository 根目錄**
- 將 `index.html` 放在專案根目錄
- 到 Settings → Pages，選擇 `main` branch 和 `/root`
- 網址：`https://username.github.io/repo-name/`

**方式 2：使用 docs 資料夾（推薦）**
- 創建 `docs/` 資料夾並放入前端檔案
- 到 Settings → Pages，選擇 `main` branch 和 `/docs`
- 適合分離前後端代碼

---

## 技術細節

**Q: 如何處理 CORS 問題？**

A: 在 Flask 後端使用 `flask-cors`：
```python
from flask_cors import CORS
CORS(app)
```

這允許前端從不同域名訪問 API。

**Q: 如何優化 API 效能？**

A: 建議實作快取機制：
- 使用 `functools.lru_cache` 快取常用查詢
- Neurosynth 資料不常變動，適合快取
- 減少重複計算和 API 呼叫

**Q: 如何處理錯誤？**

A: 在 Flask 中統一處理錯誤：
```python
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500
```

---

## 專案檔案結構

```
neurosynth-dissociation/
├── app.py                 # Flask 後端主程式
├── requirements.txt       # Python 依賴
├── render.yaml           # Render 部署配置
├── docs/                 # 前端檔案（GitHub Pages）
│   └── index.html       # 前端介面
└── README.md            # 專案說明
```

---

## 使用範例

**Q: 如何查詢兩個大腦區域的功能分離？**

A: 使用座標端點：
```
GET /dissociate/locations/0_-52_26/-2_50_-6
```

回應包含：
- 區域 A 特異性術語（在 A 更活躍）
- 區域 B 特異性術語（在 B 更活躍）
- 每個術語的 z-score 和 p-value

**Q: 如何查詢兩個認知功能的差異？**

A: 使用術語端點：
```
GET /dissociate/terms/memory/attention
```

回應顯示哪些大腦區域在記憶和注意力任務中有不同的激活模式。

---

## 下一步開發建議

1. **增強前端介面**
   - 添加視覺化圖表（使用 Chart.js 或 D3.js）
   - 顯示大腦激活熱圖
   - 改善使用者體驗

2. **優化後端效能**
   - 實作 Redis 快取
   - 添加請求限流
   - 優化資料庫查詢

3. **擴充功能**
   - 支援多個術語比較
   - 導出結果為 CSV/JSON
   - 添加使用者認證

4. **文檔完善**
   - API 文檔（使用 Swagger/OpenAPI）
   - 使用教學
   - 範例代碼

---