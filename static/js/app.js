document.addEventListener('DOMContentLoaded', () => {
    const toolList = document.getElementById('tool-list');
    const toolFrame = document.getElementById('tool-frame');
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

            let firstToolLink = null;
            let firstToolPath = null;

            categories.forEach(category => {
                // Create category header
                const categoryHeader = document.createElement('li');
                categoryHeader.classList.add('category-header', 'expanded'); // Add classes for styling and initial state
                categoryHeader.textContent = category.categoryName;
                toolList.appendChild(categoryHeader);

                // Create nested list for tools in this category
                const nestedList = document.createElement('ul');
                nestedList.classList.add('nested-tool-list'); // Add class for styling
                toolList.appendChild(nestedList);

                // Add click listener to toggle nested list
                categoryHeader.addEventListener('click', () => {
                    nestedList.style.display = nestedList.style.display === 'none' ? 'block' : 'none';
                    categoryHeader.classList.toggle('expanded');
                    categoryHeader.classList.toggle('collapsed'); // Toggle collapse class
                });

                // Initially hide the list if needed (or manage via CSS)
                // nestedList.style.display = 'none'; // Start collapsed if desired

                if (Array.isArray(category.tools)) {
                    category.tools.forEach((tool) => {
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.textContent = tool.name_zh;
                        link.title = tool.name_en;
                        link.href = '#'; // Prevent page reload
                        link.dataset.path = tool.path; // Store path in data attribute
                        link.dataset.filePath = tool.filePath; // Store file path
                        link.dataset.nameEn = tool.name_en;

                        link.href = `#${tool.path}`;

                        listItem.appendChild(link);
                        nestedList.appendChild(listItem); // Append to nested list
                        sidebarLinks.push(link); // Add link to our array

                        // Store the first tool's details to load it by default
                        if (!firstToolLink) {
                            firstToolLink = link;
                            firstToolPath = tool.filePath;
                        }
                    });
                }
            });

            // Initial load based on hash
            handleHashChange();

            // Listen for hash changes
            window.addEventListener('hashchange', handleHashChange);
        })
        .catch(error => {
            console.error('Error fetching or processing tools.json:', error); // Log fetch/processing error
            toolList.innerHTML = '<li>Error loading tools. Check console for details.</li>';
            // Optionally display error in the iframe or main content area
            // toolFrame.srcdoc = `<p style="color: red;">Error loading tool configuration: ${error.message}</p>`;
        });

    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.toLowerCase();
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
    });

    function handleHashChange() {
        const path = window.location.hash.substring(1);
        const toolLink = sidebarLinks.find(link => link.dataset.path === path);

        if (toolLink) {
            loadTool(toolLink.dataset.filePath, toolLink);
        } else {
            const firstToolLink = sidebarLinks[0];
            if (firstToolLink) {
                // Update hash to the default tool, which will trigger load via hashchange
                window.location.hash = firstToolLink.dataset.path;
            }
        }
    }

    function loadTool(filePath, clickedLink) {
        if (filePath && typeof filePath === 'string' && filePath.trim() !== '') {
            toolFrame.src = filePath;
            sidebarLinks.forEach(link => link.classList.remove('active'));
            if (clickedLink) {
                clickedLink.classList.add('active');
            }
        } else {
            console.error('Invalid tool path:', filePath);
        }
    }
});
