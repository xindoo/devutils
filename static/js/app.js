document.addEventListener('DOMContentLoaded', () => {
    const toolList = document.getElementById('tool-list');
    const toolFrame = document.getElementById('tool-frame');
    const toolCards = document.getElementById('tool-cards');
    const mainContent = document.getElementById('main-content');
    const sidebarLinks = []; // To manage active state
    const searchBox = document.getElementById('search-box');

    console.log('Fetching tools...'); // Log start
    fetch('/tools.json') // Fetch the tool list from the root
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

            categories.forEach(category => {
                // Create category header for sidebar
                const categoryHeader = document.createElement('li');
                categoryHeader.classList.add('category-header', 'expanded');
                categoryHeader.textContent = category.categoryName;
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
                
                const categoryTitle = document.createElement('h3');
                categoryTitle.classList.add('tool-category-title');
                categoryTitle.textContent = category.categoryName;
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

            // Initial load based on hash
            handleHashChange();

            // Listen for hash changes
            window.addEventListener('hashchange', handleHashChange);
        })
        .catch(error => {
            console.error('Error fetching or processing tools.json:', error);
            toolList.innerHTML = '<li>Error loading tools. Check console for details.</li>';
        });

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
        } else {
            // Show tool cards grid by default
            toolCards.style.display = 'block';
            toolFrame.style.display = 'none';
            sidebarLinks.forEach(link => link.classList.remove('active'));
        }
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
