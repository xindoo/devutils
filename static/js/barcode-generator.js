/**
 * 条形码生成 / Barcode Generator
 * 依赖 ../js/vendor/jsbarcode.min.js（JsBarcode 3.12.1, MIT）
 * 所有渲染与导出均在本地完成。
 */
(function () {
    'use strict';

    /* ---------------- 码制定义 ---------------- */

    // 通用 GS1 mod-10 校验位：最右一位权重 3，向左交替 1、3
    function gs1CheckDigit(payload) {
        var sum = 0;
        for (var i = 0; i < payload.length; i++) {
            var weight = (payload.length - i) % 2 === 1 ? 3 : 1;
            sum += parseInt(payload.charAt(i), 10) * weight;
        }
        return (10 - (sum % 10)) % 10;
    }

    var FORMATS = [
        {
            group: '通用一维码',
            format: 'CODE128',
            name: 'CODE128 (自动切换字符集)',
            sample: 'DevUtils-2024',
            hint: '最通用的码制：支持全部 ASCII 字符（含大小写与符号），自动在 A/B/C 字符集间切换，数字连续时自动压缩。',
            range: '1 ~ 80 字符（建议）'
        },
        {
            group: '通用一维码',
            format: 'CODE128A',
            name: 'CODE128 A（控制字符 + 大写）',
            sample: 'CODE128A-01',
            hint: '仅支持 ASCII 0-95：大写字母、数字与常见符号，不能用小写字母。',
            range: '1 ~ 80 字符'
        },
        {
            format: 'CODE128B',
            group: '通用一维码',
            name: 'CODE128 B（全可见 ASCII）',
            sample: 'Code128b-01',
            hint: '支持 ASCII 32-127：大小写字母、数字与符号，不能包含控制字符。',
            range: '1 ~ 80 字符'
        },
        {
            format: 'CODE128C',
            group: '通用一维码',
            name: 'CODE128 C（纯数字，双位压缩）',
            sample: '1234567890',
            hint: '仅支持数字，且位数必须为偶数；每两个数字占一个符号，条码更短、密度更高。',
            range: '偶数位数字'
        },
        {
            format: 'CODE39',
            group: '通用一维码',
            name: 'CODE39（可含 mod 43 校验）',
            sample: 'DEVUTILS-2024',
            hint: '支持 0-9、A-Z 与大写符号 - . 空格 $ / + %，字母会被自动转为大写；可勾选 mod 43 校验位。',
            range: '1 ~ 40 字符（建议）'
        },
        {
            format: 'CODE93',
            group: '通用一维码',
            name: 'CODE93（自带双校验位）',
            sample: 'DEVUTILS 2024',
            hint: '支持 0-9、A-Z 与 - . 空格 $ / + %，密度高于 CODE39，编码时自动附加 C、K 两个校验位。',
            range: '1 ~ 40 字符（建议）'
        },
        {
            format: 'CODE93FullASCII',
            group: '通用一维码',
            name: 'CODE93 扩展（全 ASCII）',
            sample: 'devutils@2024',
            hint: '支持完整 ASCII（含小写字母），用小写字母时条码会更长。',
            range: '1 ~ 40 字符（建议）'
        },
        {
            format: 'EAN13',
            group: '商品码（GS1）',
            name: 'EAN-13（国际商品码）',
            sample: '6901234567892',
            hint: '零售商品标准码：输入 12 位数字时自动补第 13 位校验位；输入 13 位时校验位必须正确。',
            range: '12 或 13 位数字',
            check: 'ean13'
        },
        {
            format: 'EAN8',
            group: '商品码（GS1）',
            name: 'EAN-8（短版商品码）',
            sample: '96385074',
            hint: '小包装商品码：输入 7 位数字时自动补校验位；输入 8 位时校验位必须正确。',
            range: '7 或 8 位数字',
            check: 'ean8'
        },
        {
            format: 'UPC',
            group: '商品码（GS1）',
            name: 'UPC-A（北美商品码）',
            sample: '123456789012',
            hint: '北美零售标准码：输入 11 位数字时自动补校验位；输入 12 位时校验位必须正确。',
            range: '11 或 12 位数字',
            check: 'upc'
        },
        {
            format: 'UPCE',
            group: '商品码（GS1）',
            name: 'UPC-E（压缩版 UPC）',
            sample: '123456',
            hint: '输入 6 位中间数字即可自动展开为 UPC-A；也可输入完整 8 位（首位 0/1 + 6 位 + 校验位）。',
            range: '6 位或 8 位数字'
        },
        {
            format: 'EAN5',
            group: '商品码（GS1）',
            name: 'EAN-5（价格附加码）',
            sample: '52495',
            hint: '常用于图书 / 期刊的附加码，编码 5 位数字，校验由奇偶组合规则决定。',
            range: '5 位数字'
        },
        {
            format: 'EAN2',
            group: '商品码（GS1）',
            name: 'EAN-2（期刊期号附加码）',
            sample: '12',
            hint: '2 位附加码，常与 EAN-13 搭配表示期号；条码尺寸较小，需按实际场景放大。',
            range: '2 位数字'
        },
        {
            format: 'ITF14',
            group: '物流 / 仓储',
            name: 'ITF-14（外箱码 / GTIN-14）',
            sample: '12345678901231',
            hint: '纸箱外包装标准码：输入 13 位数字时自动补校验位；输入 14 位时校验位必须正确。条宽建议 ≥ 4px。',
            range: '13 或 14 位数字',
            check: 'itf14'
        },
        {
            format: 'ITF',
            group: '物流 / 仓储',
            name: 'ITF / Interleaved 2 of 5',
            sample: '1234567890',
            hint: '仅支持数字且位数必须为偶数，常用于仓储内部标签。',
            range: '偶数位数字'
        },
        {
            format: 'MSI',
            group: '物流 / 仓储',
            name: 'MSI（无校验位）',
            sample: '1234567890',
            hint: '超市 / 仓储用的纯数字码，本身不含校验位；需要校验请选择 MSI10 / MSI11 等变体。',
            range: '纯数字'
        },
        {
            format: 'MSI10',
            group: '物流 / 仓储',
            name: 'MSI mod 10（追加 1 位校验）',
            sample: '1234567890',
            hint: '在输入后自动追加 1 位 mod 10 校验位，无需自行计算。',
            range: '纯数字'
        },
        {
            format: 'MSI11',
            group: '物流 / 仓储',
            name: 'MSI mod 11（追加 1 位校验）',
            sample: '1234567890',
            hint: '在输入后自动追加 1 位 mod 11 校验位。',
            range: '纯数字'
        },
        {
            format: 'MSI1010',
            group: '物流 / 仓储',
            name: 'MSI mod 10 + mod 10（双校验）',
            sample: '1234567890',
            hint: '依次追加两位 mod 10 校验位，校验能力更强。',
            range: '纯数字'
        },
        {
            format: 'MSI1110',
            group: '物流 / 仓储',
            name: 'MSI mod 11 + mod 10（双校验）',
            sample: '1234567890',
            hint: '先追加 mod 11 校验位，再追加 mod 10 校验位。',
            range: '纯数字'
        },
        {
            format: 'pharmacode',
            group: '物流 / 仓储',
            name: 'Pharmacode（药品包装码）',
            sample: '12345',
            hint: '医药包装专用：支持 3 ~ 131070 之间的整数，条码不带文本。',
            range: '整数 3 ~ 131070'
        },
        {
            format: 'codabar',
            group: '物流 / 仓储',
            name: 'Codabar（血库 / 快递单据）',
            sample: '123456789',
            hint: '支持 0-9 与 - $ : . + /；输入普通数字时自动在首尾加 A 作为起始 / 终止符，也可自行指定 A-D。',
            range: '建议 4 ~ 20 位'
        }
    ];

    var FORMAT_MAP = {};
    FORMATS.forEach(function (f) {
        FORMAT_MAP[f.format] = f;
    });

    // 需要展示“自动补校验位”提示的码制：payload 长度 → 完整长度
    var CHECK_LENGTHS = {
        ean13: { payload: 12, total: 13 },
        ean8: { payload: 7, total: 8 },
        upc: { payload: 11, total: 12 },
        itf14: { payload: 13, total: 14 }
    };

    /* ---------------- DOM ---------------- */

    var formatSelect = document.getElementById('bcFormat');
    var formatHint = document.getElementById('bcFormatHint');
    var valueInput = document.getElementById('bcValue');
    var sampleBtn = document.getElementById('bcSampleBtn');
    var checkLine = document.getElementById('bcCheckLine');
    var displayValue = document.getElementById('bcDisplayValue');
    var transparentBg = document.getElementById('bcTransparent');
    var mod43Row = document.getElementById('bcMod43Row');
    var mod43 = document.getElementById('bcMod43');
    var widthInput = document.getElementById('bcWidth');
    var heightInput = document.getElementById('bcHeight');
    var fontSizeInput = document.getElementById('bcFontSize');
    var textMarginInput = document.getElementById('bcTextMargin');
    var marginInput = document.getElementById('bcMargin');
    var textPosition = document.getElementById('bcTextPosition');
    var lineColor = document.getElementById('bcLineColor');
    var bgColor = document.getElementById('bcBgColor');
    var lineColorCode = document.getElementById('bcLineColorCode');
    var bgColorCode = document.getElementById('bcBgColorCode');
    var svg = document.getElementById('bcSvg');
    var emptyHint = document.getElementById('bcEmpty');
    var meta = document.getElementById('bcMeta');
    var scaleSelect = document.getElementById('bcScale');
    var pngBtn = document.getElementById('bcPngBtn');
    var svgBtn = document.getElementById('bcSvgBtn');
    var copyBtn = document.getElementById('bcCopyBtn');
    var errorBox = document.getElementById('bcError');

    if (!formatSelect || typeof window.JsBarcode !== 'function') {
        if (errorBox) {
            showError('条码渲染库加载失败，请检查网络后刷新页面（static/js/vendor/jsbarcode.min.js）。');
            errorBox.hidden = false;
        }
        return;
    }

    var currentFormat = null;
    var currentValue = '';
    var lastError = '';

    /* ---------------- 工具函数 ---------------- */

    function showError(message) {
        lastError = message || '';
        errorBox.textContent = lastError;
        errorBox.hidden = !lastError;
    }

    function clearError() {
        showError('');
    }

    function clearSvg() {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.removeAttribute('viewBox');
    }

    function toInt(input, fallback, min, max) {
        var n = parseInt(input.value, 10);
        if (isNaN(n)) n = fallback;
        return Math.min(max, Math.max(min, n));
    }

    function currentOptions() {
        var opts = {
            format: currentFormat.format,
            width: toInt(widthInput, 2, 1, 6),
            height: toInt(heightInput, 100, 24, 200),
            displayValue: displayValue.checked,
            textMargin: toInt(textMarginInput, 2, 0, 20),
            fontSize: toInt(fontSizeInput, 18, 8, 40),
            textPosition: textPosition.value,
            font: 'monospace',
            lineColor: lineColor.value,
            margin: toInt(marginInput, 10, 0, 60),
            background: transparentBg.checked ? '' : bgColor.value
        };
        if (currentFormat.format === 'CODE39') {
            opts.mod43 = mod43.checked;
        }
        return opts;
    }

    // 归一化用户输入：去掉首尾空白；部分码制允许忽略空格与连字符
    function normalizeValue(format, raw) {
        var v = raw.replace(/\r?\n/g, '').trim();
        if (format === 'EAN13' || format === 'EAN8' || format === 'UPC' || format === 'ITF14' ||
            format === 'EAN5' || format === 'EAN2' || format === 'ITF' || format === 'MSI' ||
            format === 'MSI10' || format === 'MSI11' || format === 'MSI1010' || format === 'MSI1110') {
            v = v.replace(/[-\s]/g, '');
        }
        return v;
    }

    // 校验位提示：返回提示文案或空串
    function checksumHint(format, value) {
        var spec = CHECK_LENGTHS[format.check];
        if (!spec) return '';

        if (/^[0-9]+$/.test(value) && value.length === spec.payload) {
            var digit = gs1CheckDigit(value);
            return '校验位将自动补为 ' + digit + ' → 完整码 ' + value + digit + '（共 ' + spec.total + ' 位）';
        }
        if (/^[0-9]+$/.test(value) && value.length === spec.total) {
            var expect = gs1CheckDigit(value.slice(0, spec.payload));
            var actual = parseInt(value.charAt(spec.total - 1), 10);
            if (expect === actual) {
                return '校验位 ' + actual + ' 正确';
            }
            return '校验位应为 ' + expect + '，当前为 ' + actual + '，将无法生成';
        }
        return '需要 ' + spec.payload + ' 位数字（自动补校验位）或 ' + spec.total + ' 位完整数字';
    }

    function syncColorCodes() {
        lineColorCode.textContent = lineColor.value;
        bgColorCode.textContent = bgColor.value;
    }

    function updateFormatUi() {
        var f = FORMAT_MAP[formatSelect.value] || FORMATS[0];
        currentFormat = f;
        formatHint.textContent = f.hint + '　允许输入：' + f.range + '。';
        mod43Row.hidden = f.format !== 'CODE39';
        valueInput.placeholder = '示例：' + f.sample;
        syncColorCodes();
    }

    function setExportEnabled(enabled) {
        pngBtn.disabled = !enabled;
        svgBtn.disabled = !enabled;
        copyBtn.disabled = !enabled;
    }

    function render() {
        updateFormatUi();
        clearError();

        var raw = valueInput.value;
        var value = raw.trim() === '' ? '' : normalizeValue(currentFormat.format, raw);

        currentValue = value;
        clearSvg();
        setExportEnabled(false);

        if (value === '') {
            emptyHint.hidden = false;
            emptyHint.textContent = '输入内容后自动生成';
            meta.textContent = '等待输入';
            checkLine.hidden = true;
            return;
        }

        // 校验位提示（在渲染前展示，即使渲染失败也有指引）
        var hintText = checksumHint(currentFormat, value);
        checkLine.hidden = hintText === '';
        checkLine.textContent = hintText;

        var options = currentOptions();

        try {
            window.JsBarcode(svg, value, options);
        } catch (err) {
            // JsBarcode 抛的是压缩后的英文错误（如 'xxx is not a valid input for e'），
            // 对用户无意义，这里统一换成中文原因说明
            clearSvg();
            emptyHint.hidden = false;
            emptyHint.textContent = '无法生成：输入不符合 ' + currentFormat.format + ' 规则';
            meta.textContent = '码制 ' + currentFormat.format + ' · 输入 ' + value.length + ' 位';
            showError('「' + value + '」不满足 ' + currentFormat.format + ' 的编码规则。' +
                (hintText || currentFormat.hint));
            return;
        }

        emptyHint.hidden = true;

        // 渲染结果自检：确认真的画出了条形（避免静默失败）
        var bars = svg.querySelectorAll('rect');
        if (bars.length === 0) {
            clearSvg();
            emptyHint.hidden = false;
            emptyHint.textContent = '未生成条形码';
            showError('渲染结果为空，请检查输入内容。');
            return;
        }

        var w = svg.getAttribute('width') || '';
        var h = svg.getAttribute('height') || '';
        meta.textContent = '码制 ' + currentFormat.format + ' · 输入 ' + value.length + ' 字符 · 图形 ' +
            w + ' × ' + h;
        setExportEnabled(true);
    }

    /* ---------------- 序列化 / 导出 ---------------- */

    function serializeSvg() {
        var clone = svg.cloneNode(true);
        // 导出文件去掉页面级属性，避免嵌入到其他页面时 id 冲突
        clone.removeAttribute('id');
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        clone.removeAttribute('style');

        var bg = bgColor.value;
        // 内联背景 rect，保证在编辑器 / 其他应用中打开时底色正确
        if (!transparentBg.checked) {
            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', bg);
            clone.insertBefore(rect, clone.firstChild);
        }

        var text = new XMLSerializer().serializeToString(clone);
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + text + '\n';
    }

    function fileBaseName() {
        var safe = currentValue.replace(/[^0-9A-Za-z_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);
        return 'barcode-' + currentFormat.format.toLowerCase() + (safe ? '-' + safe : '');
    }

    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 1500);
    }

    function downloadSvg() {
        if (svgBtn.disabled) return;
        clearError();
        var text = serializeSvg();
        downloadBlob(new Blob([text], { type: 'image/svg+xml;charset=utf-8' }), fileBaseName() + '.svg');
    }

    function downloadPng() {
        if (pngBtn.disabled) return;
        clearError();

        var scale = parseInt(scaleSelect.value, 10) || 2;
        var base = currentOptions();
        // 直接使用 canvas 渲染器按倍数放大，避免 SVG 栅格化的字体与抗锯齿差异
        var canvas = document.createElement('canvas');
        var scaled = {
            format: base.format,
            width: Math.max(1, Math.round(base.width * scale)),
            height: Math.round(base.height * scale),
            displayValue: base.displayValue,
            textMargin: Math.round(base.textMargin * scale),
            fontSize: Math.round(base.fontSize * scale),
            textPosition: base.textPosition,
            font: base.font,
            lineColor: base.lineColor,
            margin: Math.round(base.margin * scale),
            background: base.background
        };
        if (base.format === 'CODE39') {
            scaled.mod43 = base.mod43;
        }

        try {
            window.JsBarcode(canvas, currentValue, scaled);
        } catch (err) {
            showError('PNG 导出失败：当前内容或参数无法生成条码，请先修正预览区提示。');
            return;
        }

        canvas.toBlob(function (blob) {
            if (!blob) {
                showError('PNG 导出失败：浏览器未能生成图片数据。');
                return;
            }
            downloadBlob(blob, fileBaseName() + '@' + scale + 'x.png');
        }, 'image/png');
    }

    function copySvg() {
        if (copyBtn.disabled) return;
        clearError();
        var text = serializeSvg();
        var done = function () {
            copyBtn.textContent = '已复制';
            setTimeout(function () {
                copyBtn.textContent = '复制 SVG';
            }, 1500);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () {
                fallbackCopy(text, done);
            });
        } else {
            fallbackCopy(text, done);
        }
    }

    function fallbackCopy(text, onDone) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-9999px';
        document.body.appendChild(area);
        area.select();
        try {
            if (document.execCommand('copy')) {
                onDone();
            } else {
                showError('复制失败，请手动下载 SVG 文件。');
            }
        } catch (e) {
            showError('复制失败，请手动下载 SVG 文件。');
        }
        document.body.removeChild(area);
    }

    /* ---------------- 初始化 ---------------- */

    function buildFormatSelect() {
        var groups = [];
        FORMATS.forEach(function (f) {
            var last = groups[groups.length - 1];
            if (!last || last.name !== f.group) {
                last = { name: f.group, items: [] };
                groups.push(last);
            }
            last.items.push(f);
        });

        groups.forEach(function (g) {
            var optgroup = document.createElement('optgroup');
            optgroup.label = g.name;
            g.items.forEach(function (f) {
                var option = document.createElement('option');
                option.value = f.format;
                option.textContent = f.name;
                optgroup.appendChild(option);
            });
            formatSelect.appendChild(optgroup);
        });

        formatSelect.value = 'CODE128';
    }

    // 输入实时渲染；参数修改同样即时生效
    var renderTimer = null;
    function scheduleRender() {
        if (renderTimer) clearTimeout(renderTimer);
        renderTimer = setTimeout(function () {
            renderTimer = null;
            render();
        }, 90);
    }

    formatSelect.addEventListener('change', function () {
        // 只在输入框为空时填入该码制示例；已有内容一律保留，
        // 是否合法交给 render() 判定并给出提示，避免误删用户输入
        if (valueInput.value.trim() === '') {
            var f = FORMAT_MAP[formatSelect.value];
            valueInput.value = f ? f.sample : '';
        }
        render();
    });

    valueInput.addEventListener('input', scheduleRender);
    valueInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            render();
        }
    });

    sampleBtn.addEventListener('click', function () {
        valueInput.value = currentFormat.sample;
        render();
        valueInput.focus();
    });

    [displayValue, transparentBg, mod43, textPosition].forEach(function (el) {
        el.addEventListener('change', render);
    });

    [widthInput, heightInput, fontSizeInput, textMarginInput, marginInput].forEach(function (el) {
        el.addEventListener('input', scheduleRender);
        el.addEventListener('change', render);
    });

    function colorChanged() {
        syncColorCodes();
        scheduleRender();
    }

    lineColor.addEventListener('input', colorChanged);
    lineColor.addEventListener('change', render);
    bgColor.addEventListener('input', colorChanged);
    bgColor.addEventListener('change', render);

    pngBtn.addEventListener('click', downloadPng);
    svgBtn.addEventListener('click', downloadSvg);
    copyBtn.addEventListener('click', copySvg);

    buildFormatSelect();
    // 首次打开：输入框为空则预填默认码制的示例，让预览区立刻有条码
    if (valueInput.value.trim() === '') {
        valueInput.value = FORMAT_MAP[formatSelect.value].sample;
    }
    render();

    // 暴露给自动化测试使用，避免为了测试引入额外逻辑分支
    window.__barcodeTool = {
        formats: FORMATS.map(function (f) { return f.format; }),
        gs1CheckDigit: gs1CheckDigit,
        render: render,
        serializeSvg: serializeSvg,
        getState: function () {
            return {
                format: currentFormat && currentFormat.format,
                value: currentValue,
                error: lastError,
                svgWidth: svg.getAttribute('width'),
                svgHeight: svg.getAttribute('height'),
                bars: svg.querySelectorAll('rect').length,
                exportEnabled: !pngBtn.disabled
            };
        }
    };
})();
