# 🚀 DevUtils 快速启动指南

## 查看效果

### 方法 1: 使用 Python
```bash
cd /Users/xindoo/Documents/code/devutils
python3 -m http.server 8080
```

然后打开浏览器访问：`http://localhost:8080/index.html`

### 方法 2: 使用其他 Web 服务器
```bash
# 使用 Node.js (http-server)
npx http-server -p 8080

# 使用 PHP
php -S localhost:8080
```

---

## 🎨 主题切换

### 切换方式
1. **鼠标**: 点击侧边栏顶部的主题切换按钮（太阳/月亮图标）
2. **键盘**: Tab 键聚焦到按钮 → 按 Enter 或 Space 切换

### 主题效果
- **浅色模式**: 淡蓝色背景，适合明亮环境
- **深色模式**: 深色背景，适合夜间或低光环境

### 主题保存
- 主题选择自动保存到浏览器
- 刷新页面后保持你的选择
- 在所有工具页面中生效

---

## 📁 项目结构

```
devutils/
├── index.html                 # 主页面
├── tools.json                 # 工具配置
├── static/
│   ├── css/
│   │   └── style.css         # 全局样式（含主题）
│   ├── js/
│   │   ├── app.js            # 主应用逻辑
│   │   ├── theme-switcher.js # 主题切换
│   │   └── tool-theme-helper.js # 工具页面主题支持
│   └── tools/
│       ├── base64.html       # Base64 工具
│       ├── json-format.html  # JSON 格式化
│       └── ... (28个工具)
└── docs/
    ├── DESIGN_SYSTEM.md      # 设计系统文档
    ├── DARK_MODE_UPDATE.md   # 暗色模式更新报告
    └── THEME_TESTING_CHECKLIST.md # 测试清单
```

---

## 🛠️ 开发指南

### 创建新工具页面

1. 复制模板文件：
```bash
cp static/tools/base64.html static/tools/new-tool.html
```

2. 编辑 HTML 文件，确保包含：
```html
<head>
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/tool-theme-helper.js"></script>
</head>
<body>
    <div class="tool-container">
        <div class="tool-header">
            <h1>工具标题</h1>
            <p>工具描述</p>
        </div>
        <!-- 工具内容 -->
    </div>
</body>
```

3. 在 `tools.json` 中注册：
```json
{
    "name_zh": "新工具",
    "name_en": "New Tool",
    "path": "category/new-tool",
    "filePath": "static/tools/new-tool.html"
}
```

### 使用 CSS 变量

**推荐**: 使用 CSS 变量而非硬编码颜色
```css
/* 好的做法 ✅ */
.my-element {
    background: var(--surface);
    color: var(--text-primary);
    border: 1px solid var(--border);
}

/* 避免硬编码 ❌ */
.my-element {
    background: #ffffff;
    color: #333333;
    border: 1px solid #cccccc;
}
```

### 可用的 CSS 变量

```css
/* 颜色 */
--primary              /* 主色 */
--primary-dark         /* 深主色 */
--secondary            /* 次要色 */
--text-primary         /* 主要文字 */
--text-secondary       /* 次要文字 */
--text-muted           /* 辅助文字 */
--surface              /* 表面 */
--surface-hover        /* 表面 hover */
--border               /* 边框 */
--glass-bg             /* 玻璃背景 */
--glass-border         /* 玻璃边框 */
--shadow-color         /* 阴影 */

/* 布局 */
--border-radius        /* 大圆角 16px */
--border-radius-sm     /* 小圆角 12px */
--blur-amount          /* 模糊程度 20px */

/* 动画 */
--transition-fast      /* 快速过渡 150ms */
--transition-normal    /* 普通过渡 250ms */
```

---

## 🧪 测试

### 快速测试
```bash
# 1. 启动服务器
python3 -m http.server 8080

# 2. 打开浏览器
open http://localhost:8080/index.html

# 3. 测试主题切换
# - 点击主题切换按钮
# - 刷新页面，检查主题是否保持
# - 打开任意工具页面，检查主题是否同步
```

### 完整测试
参考 `THEME_TESTING_CHECKLIST.md` 进行全面测试

---

## 📚 文档

- **DESIGN_SYSTEM.md** - 完整的设计系统文档
- **UI_REDESIGN_SUMMARY.md** - UI 重设计总结
- **DARK_MODE_UPDATE.md** - 暗色模式实现报告
- **THEME_TESTING_CHECKLIST.md** - 主题测试清单

---

## 🔧 常见问题

### Q: 主题切换后刷新页面又变回去了？
A: 检查浏览器是否允许 localStorage。可以在控制台运行：
```javascript
localStorage.setItem('test', '1');
```

### Q: 工具页面没有应用主题？
A: 确保工具页面包含了 `tool-theme-helper.js`：
```html
<script src="../js/tool-theme-helper.js"></script>
```

### Q: 如何自定义主题颜色？
A: 编辑 `static/css/style.css`，修改 `:root` 和 `[data-theme="dark"]` 中的 CSS 变量

### Q: 如何重置主题？
A: 在浏览器控制台运行：
```javascript
localStorage.removeItem('devutils-theme');
location.reload();
```

---

## 🎯 关键特性

✅ **28 个工具全部支持主题切换**
✅ **一键切换，即时生效**
✅ **主题自动保存**
✅ **响应式设计（桌面/平板/移动）**
✅ **键盘导航支持**
✅ **性能优化，无闪烁**
✅ **Glassmorphism 玻璃拟态设计**

---

## 💡 提示

- 在明亮环境下使用浅色模式
- 在暗处或夜间使用深色模式减少眼睛疲劳
- 主题会在所有工具页面中同步
- 支持键盘操作，提升可访问性

---

**享受使用 DevUtils！** 🎉

如有问题，请查看详细文档或提交 Issue。
