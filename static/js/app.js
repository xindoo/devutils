document.addEventListener('DOMContentLoaded', () => {
    const toolList = document.getElementById('tool-list');
    const toolFrame = document.getElementById('tool-frame');
    const sidebarLinks = []; // To manage active state

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
                        link.textContent = tool.name;
                        link.href = '#'; // Prevent page reload
                        link.dataset.path = tool.path; // Store path in data attribute

                        link.addEventListener('click', (event) => {
                            event.preventDefault(); // Prevent default anchor behavior
                            loadTool(tool.path, link);
                        });

                        listItem.appendChild(link);
                        nestedList.appendChild(listItem); // Append to nested list
                        sidebarLinks.push(link); // Add link to our array

                        // Store the first tool's details to load it by default
                        if (!firstToolLink) {
                            firstToolLink = link;
                            firstToolPath = tool.path;
                        }
                    });
                }
            });

            // Load the first tool found by default
            if (firstToolLink && firstToolPath) {
                console.log('First tool loaded:', firstToolPath); // Log first tool load
                loadTool(firstToolPath, firstToolLink);
            } else {
                 console.log('No tools found to load by default.'); // Log if no tools found
                 toolList.innerHTML = '<li>No tools found in categories.</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching or processing tools.json:', error); // Log fetch/processing error
            toolList.innerHTML = '<li>Error loading tools. Check console for details.</li>';
            // Optionally display error in the iframe or main content area
            // toolFrame.srcdoc = `<p style="color: red;">Error loading tool configuration: ${error.message}</p>`;
        });

    function loadTool(path, clickedLink) {
        // Check if path is valid (basic check)
        if (path && typeof path === 'string' && path.trim() !== '') {
            toolFrame.src = path; // Load the tool's HTML page into the iframe

            // Update active state for sidebar links
            sidebarLinks.forEach(link => link.classList.remove('active'));
            if (clickedLink) {
                clickedLink.classList.add('active');
            }
        } else {
            console.error('Invalid tool path:', path);
            // Optionally clear the iframe or show an error message
            // toolFrame.src = '';
            // toolFrame.srcdoc = '<p style="color: red;">Invalid tool path specified.</p>';
        }
    }
});
