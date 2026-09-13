document.addEventListener('DOMContentLoaded', () => {
    const toolList = document.getElementById('tool-list');
    const toolFrame = document.getElementById('tool-frame');
    const toolCards = document.getElementById('tool-cards');
    const mainContent = document.getElementById('main-content');
    const sidebarLinks = []; // To manage active state
    const searchBox = document.getElementById('search-box');

    console.log('Fetching tools...'); // Log start
    fetch('tools.json') // Fetch relative to index.html (works under GitHub Pages subpath)
        .then(response => {
            console.log('Fetch response received:', response.status); // Log status
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(categories => {
            console.log('Processing categories:', categories); // Log received data
            if (!Array.isArray(categories) || categories.length === 0) {
                console.error('No categories found or invalid format.'); // Log error
                toolList.innerHTML = '<li>No tools configured or invalid format.</li>';
                return;
            }

            // Per-category hue: visual wayfinding so 56 tools read as 11 colored regions.
            // Hand-picked, stable values — not derived from order, so reordering tools.json won't shift them.
            const categoryHues = {
                '编解码': 215,    // cobalt
                '格式化': 165,    // teal
                'JSON工具': 262,  // violet
                '图片工具': 24,    // orange
                '数据生成': 348,  // rose
                '文本工具': 190,  // cyan
                '音视频工具': 285, // purple
                '转换器': 150,    // green
                '安全工具': 5,    // red
                '网络工具': 205,  // sky
                '其他工具': 45    // gold
            };
            const hueFor = (name) => categoryHues[name] !== undefined ? categoryHues[name] : (name.charCodeAt(0) * 7) % 360;
            let totalTools = 0;

            categories.forEach((category) => {
                const toolCount = Array.isArray(category.tools) ? category.tools.length : 0;
                totalTools += toolCount;
                const hue = hueFor(category.categoryName);

                // Create category header for sidebar
                const categoryHeader = document.createElement('li');
                categoryHeader.classList.add('category-header', 'expanded');
                categoryHeader.style.setProperty('--hue', hue);

                const headerName = document.createElement('span');
                headerName.className = 'cat-name';
                headerName.textContent = category.categoryName;

                const headerDot = document.createElement('span');
                headerDot.className = 'cat-dot';

                const headerCount = document.createElement('span');
                headerCount.className = 'cat-count';
                headerCount.textContent = toolCount;

                categoryHeader.appendChild(headerDot);
                categoryHeader.appendChild(headerName);
                categoryHeader.appendChild(headerCount);
                toolList.appendChild(categoryHeader);

                // Create nested list for tools in this category
                const nestedList = document.createElement('ul');
                nestedList.classList.add('nested-tool-list');
                toolList.appendChild(nestedList);

                // Add click listener to toggle nested list
                categoryHeader.addEventListener('click', () => {
                    nestedList.style.display = nestedList.style.display === 'none' ? 'block' : 'none';
                    categoryHeader.classList.toggle('expanded');
                    categoryHeader.classList.toggle('collapsed');
                });

                // Create category section for cards
                const categorySection = document.createElement('div');
                categorySection.classList.add('tool-category-section');
                categorySection.style.setProperty('--hue', hue);
                
                const categoryTitle = document.createElement('h3');
                categoryTitle.classList.add('tool-category-title');

                const titleDot = document.createElement('span');
                titleDot.className = 'cat-dot';
                const titleName = document.createElement('span');
                titleName.textContent = category.categoryName;
                const titleCount = document.createElement('span');
                titleCount.className = 'cat-count';
                titleCount.textContent = toolCount + ' 个工具';

                categoryTitle.appendChild(titleDot);
                categoryTitle.appendChild(titleName);
                categoryTitle.appendChild(titleCount);
                categorySection.appendChild(categoryTitle);

                const categoryCardGrid = document.createElement('div');
                categoryCardGrid.classList.add('tool-cards-grid');
                categorySection.appendChild(categoryCardGrid);

                toolCards.appendChild(categorySection);


                if (Array.isArray(category.tools)) {
                    category.tools.forEach((tool) => {
                        // Populate sidebar
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.textContent = tool.name_zh;
                        link.title = tool.name_en;
                        link.href = `#${tool.path}`;
                        link.dataset.path = tool.path;
                        link.dataset.filePath = tool.filePath;
                        link.dataset.nameEn = tool.name_en;
                        listItem.appendChild(link);
                        nestedList.appendChild(listItem);
                        sidebarLinks.push(link);

                        // Populate tool cards
                        const card = document.createElement('div');
                        card.classList.add('tool-card');
                        card.dataset.path = tool.path;
                        card.dataset.filePath = tool.filePath;
                        card.dataset.nameZh = tool.name_zh;
                        card.dataset.nameEn = tool.name_en;

                        card.innerHTML = `
                            <h4>${tool.name_zh}</h4>
                            <p>${tool.name_en}</p>
                        `;
                        card.addEventListener('click', () => {
                            window.location.hash = tool.path;
                        });

                        categoryCardGrid.appendChild(card);
                    });
                }
            });

            // Hero stats: real numbers, mono type
            const heroStats = document.getElementById('hero-stats');
            if (heroStats) {
                heroStats.innerHTML = `
                    <span><strong>${totalTools}</strong>个工具</span>
                    <span><strong>${categories.length}</strong>个分类</span>
                    <span>数据不出浏览器</span>
                `;
            }

            // Initial load based on hash
            handleHashChange();

            // Listen for hash changes
            window.addEventListener('hashchange', handleHashChange);
        })
        .catch(error => {
            console.error('Error fetching or processing tools.json:', error);
            toolList.innerHTML = '<li>Error loading tools. Check console for details.</li>';
        });

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const container = document.querySelector('.container');
    if (sidebarToggle && container) {
        sidebarToggle.addEventListener('click', () => {
            container.classList.toggle('sidebar-open');
        });
        // Close the sidebar after picking a tool on mobile
        toolList.addEventListener('click', (e) => {
            if (e.target.closest('a')) container.classList.remove('sidebar-open');
        });
    }

    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.toLowerCase();

        // Search sidebar
        const categories = document.querySelectorAll('.category-header');
        categories.forEach(category => {
            const nestedList = category.nextElementSibling;
            const tools = nestedList.querySelectorAll('li');
            let categoryVisible = false;

            tools.forEach(tool => {
                const toolNameZh = tool.textContent.toLowerCase();
                const toolNameEn = tool.querySelector('a').dataset.nameEn.toLowerCase();
                if (toolNameZh.includes(searchTerm) || toolNameEn.includes(searchTerm)) {
                    tool.style.display = 'block';
                    categoryVisible = true;
                } else {
                    tool.style.display = 'none';
                }
            });

            if (categoryVisible) {
                category.style.display = 'block';
                nestedList.style.display = 'block';
            } else {
                category.style.display = 'none';
                nestedList.style.display = 'none';
            }
        });

        // Search tool cards
        const categorySections = document.querySelectorAll('.tool-category-section');
        categorySections.forEach(section => {
            const cards = section.querySelectorAll('.tool-card');
            let categoryVisible = false;
            cards.forEach(card => {
                const toolNameZh = card.dataset.nameZh.toLowerCase();
                const toolNameEn = card.dataset.nameEn.toLowerCase();
                if (toolNameZh.includes(searchTerm) || toolNameEn.includes(searchTerm)) {
                    card.style.display = 'block';
                    categoryVisible = true;
                } else {
                    card.style.display = 'none';
                }
            });

            if (categoryVisible) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    });

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        // Split hash into path and query string
        const [path, queryString] = hash.split('?');
        const toolLink = sidebarLinks.find(link => link.dataset.path === path);

        if (toolLink) {
            loadTool(toolLink.dataset.filePath, toolLink, queryString);
            toolCards.style.display = 'none';
            toolFrame.style.display = 'block';
            hideHomeChrome();
        } else {
            // Show tool cards grid by default
            toolCards.style.display = 'block';
            toolFrame.style.display = 'none';
            sidebarLinks.forEach(link => link.classList.remove('active'));
            showHomeChrome();
        }
    }

    function hideHomeChrome() {
        const hero = document.getElementById('home-hero');
        const divider = document.getElementById('hero-divider');
        if (hero) hero.style.display = 'none';
        if (divider) divider.style.display = 'none';
    }

    function showHomeChrome() {
        const hero = document.getElementById('home-hero');
        const divider = document.getElementById('hero-divider');
        if (hero) hero.style.display = '';
        if (divider) divider.style.display = '';
    }

    function loadTool(filePath, clickedLink, queryString) {
        if (filePath && typeof filePath === 'string' && filePath.trim() !== '') {
            // Append query string if present
            const fullPath = queryString ? `${filePath}?${queryString}` : filePath;
            toolFrame.src = fullPath;
            sidebarLinks.forEach(link => link.classList.remove('active'));
            if (clickedLink) {
                clickedLink.classList.add('active');
            }
        } else {
            console.error('Invalid tool path:', filePath);
        }
    }
});
