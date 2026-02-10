# DevUtils 设计系统文档

## 概览
DevUtils 采用现代化的 **Glassmorphism（玻璃拟态）** 设计风格，结合浅色主题，为开发者工具提供专业、清晰且美观的用户界面。

## 设计理念
- **专业性**: 适合开发者工具的专业外观
- **清晰度**: 良好的视觉层次和可读性
- **现代感**: 使用最新的 Glassmorphism 设计趋势
- **一致性**: 所有工具页面保持统一的设计语言
- **可访问性**: 支持键盘导航、高对比度模式和屏幕阅读器

---

## 配色方案

### 主色调
```css
--primary: #3B82F6          /* 主蓝色 - 按钮、链接、强调 */
--primary-dark: #2563EB     /* 深蓝色 - hover 状态 */
--primary-light: #60A5FA    /* 浅蓝色 - 辅助元素 */
--secondary: #6366F1        /* 次要紫色 - 渐变、点缀 */
```

### 背景色
```css
--background: #F0F4F8                    /* 基础背景 */
--background-gradient-start: #E0E7FF     /* 渐变起始 */
--background-gradient-end: #F0F9FF       /* 渐变结束 */
```

### 表面色
```css
--surface: rgba(255, 255, 255, 0.7)      /* 玻璃表面 */
--surface-hover: rgba(255, 255, 255, 0.9) /* hover 状态 */
--glass-bg: rgba(255, 255, 255, 0.6)     /* 玻璃背景 */
--glass-border: rgba(255, 255, 255, 0.4) /* 玻璃边框 */
```

### 文字色
```css
--text-primary: #1E293B     /* 主要文字 */
--text-secondary: #64748B   /* 次要文字 */
--text-muted: #94A3B8       /* 辅助文字 */
```

### 边框与阴影
```css
--border: rgba(148, 163, 184, 0.3)  /* 边框颜色 */
--shadow-color: rgba(0, 0, 0, 0.1)  /* 阴影颜色 */
```

---

## 字体系统

### 字体家族
```css
标题字体: 'Poppins', sans-serif
正文字体: 'Open Sans', sans-serif
等宽字体: 'Monaco', 'Courier New', monospace
```

### Google Fonts 导入
```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
```

### 字体层级
- **H1 (工具标题)**: 2.2em, 700 weight, Poppins
- **H2 (分类标题)**: 1.5em, 700 weight, Poppins
- **H3 (卡片分类)**: 1.4em, 700 weight, Poppins
- **H4 (卡片标题)**: 1.1em, 600 weight, Poppins
- **正文**: 1em, 400-500 weight, Open Sans
- **标签**: 0.95em, 600 weight, Poppins

---

## Glassmorphism 效果

### 核心属性
```css
background: rgba(255, 255, 255, 0.6);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.4);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### 应用场景
- 侧边栏
- 主内容区域
- 工具容器
- 工具卡片
- 输入框和表单元素

---

## 组件样式

### 按钮
```css
主按钮:
- 渐变背景: linear-gradient(135deg, #3B82F6, #2563EB)
- 圆角: 12px
- 内边距: 12px 28px
- 阴影: 0 4px 12px rgba(59, 130, 246, 0.3)
- Hover: translateY(-2px) + 更深阴影
- 光晕动画效果
```

### 输入框
```css
输入框/文本域:
- 背景: rgba(255, 255, 255, 0.05)
- 边框: 1px solid rgba(148, 163, 184, 0.3)
- 圆角: 12px
- 内边距: 12px 16px
- Focus: 蓝色边框 + 外发光效果
```

### 卡片
```css
工具卡片:
- 玻璃背景 + 模糊效果
- 顶部渐变条（hover 显示）
- Hover: translateY(-8px) + 蓝色阴影
- 圆角: 16px
```

### 侧边栏链接
```css
侧边栏链接:
- 左侧蓝色指示条（hover/active）
- 平滑的背景色过渡
- Active 状态: 蓝色渐变背景 + 左边框
```

---

## 动画与过渡

### 过渡时长
```css
--transition-fast: 150ms ease    /* 快速交互 */
--transition-normal: 250ms ease  /* 一般过渡 */
```

### 动画效果
1. **背景浮动动画**: 25秒循环，轻微移动和旋转
2. **按钮光晕**: hover 时从左到右的光效
3. **卡片悬停**: 向上平移 + 阴影增强
4. **链接指示**: 左侧蓝色条 scaleY 动画

### 减少动画模式支持
```css
@media (prefers-reduced-motion: reduce) {
    /* 所有动画时长降至 0.01ms */
}
```

---

## 布局规范

### 间距系统
- 小间距: 8-12px
- 中间距: 16-24px
- 大间距: 28-40px

### 圆角系统
```css
--border-radius: 16px      /* 大圆角 */
--border-radius-sm: 12px   /* 小圆角 */
```

### 容器宽度
- 侧边栏: 280px
- 最大内容宽度: 1200px
- 容器内边距: 32px

---

## 响应式设计

### 断点
```css
移动端: max-width: 768px
平板: max-width: 1024px
桌面: > 1024px
```

### 移动端适配
- 侧边栏全宽，最大高度 50vh
- 工具卡片单列布局
- 按钮全宽显示
- 减小内边距和字号

---

## 可访问性

### 键盘导航
- 所有交互元素支持 Tab 导航
- Focus 状态: 3px 蓝色外边框
- Focus offset: 2-4px

### 对比度
- 文字对比度 ≥ 4.5:1
- 高对比度模式支持
- 边框在高对比度下加粗

### 语义化 HTML
- 正确的标题层级
- 表单标签关联
- ARIA 属性支持

---

## 自定义滚动条

```css
滚动条宽度: 8-10px
轨道: 半透明灰色
滑块: 主蓝色
Hover: 深蓝色
```

---

## 使用指南

### 创建新工具页面
1. 复制 `audio-visualization.html` 作为模板
2. 引入 `../css/style.css`
3. 使用 `.tool-container` 作为主容器
4. 添加 `.tool-header` 包含标题和描述
5. 使用 `.tool-section` 组织表单元素
6. 使用 `.tool-button` 类创建按钮
7. 使用 `.tool-input` / `.tool-textarea` 创建输入框

### 工具页面基本结构
```html
<div class="tool-container tool-container-vertical">
    <div class="tool-header">
        <h1>工具名称</h1>
        <p>工具描述</p>
    </div>

    <div class="tool-section">
        <label class="tool-label">标签</label>
        <input type="text" class="tool-input" placeholder="提示文字">
    </div>

    <div class="tool-controls">
        <button class="tool-button">操作按钮</button>
    </div>

    <div class="tool-result">
        结果显示区域
    </div>

    <div class="tool-error">
        错误信息显示
    </div>
</div>
```

---

## 浏览器兼容性

### 支持的浏览器
- Chrome/Edge 88+
- Firefox 94+
- Safari 15.4+

### Fallback
- `-webkit-backdrop-filter` 用于 Safari
- 渐变降级为纯色
- 动画在不支持的浏览器中禁用

---

## 维护建议

1. **保持一致性**: 所有新工具页面应使用相同的设计系统
2. **性能优化**: 避免过度使用 backdrop-filter
3. **测试**: 在不同设备和浏览器上测试
4. **可访问性**: 始终提供键盘导航和 ARIA 支持
5. **更新**: 定期审查设计系统并更新文档

---

## 资源链接

- [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)
- [Google Fonts - Open Sans](https://fonts.google.com/specimen/Open+Sans)
- [MDN - backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [WebAIM - Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**设计系统版本**: 1.0.0
**最后更新**: 2026-02-10
**设计师**: Claude Code + UI/UX Pro Max
