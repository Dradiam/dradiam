
    const fs = 'assets/json/main.json';
    const statusMessage = document.querySelector(".status-message");
    const terminalMenu = document.querySelector(".terminal-menu");
    const contentViewer = document.querySelector(".content-viewer");
    let itemHistory = [];

    document.querySelector(".content-viewer").addEventListener('click', (e) => {
    if (e.target.classList.contains("content-viewer")) handleBack();
    });

    terminalMenu.addEventListener('click', (e) => {
    if (e.target === terminalMenu) handleBack();
    });

    const updateHeader = async (header) => {
        const terminalHeader = document.querySelector(".terminal-header");
        terminalHeader.style.setProperty('--default-header', `"${header}"`);
    }

    const updateStatus = (message, time) => {
        statusMessage.innerHTML = message;
        setTimeout(() => {
            statusMessage.innerHTML = "";
        }, time);
    }

    const handleBack = () => {
        if (contentViewer.style.display === 'flex') {
            contentViewer.style.display = 'none';
            terminalMenu.style.display = 'flex';
            statusMessage.innerHTML = "";
        }

        if (itemHistory.length > 0) {
            const previousState = itemHistory.pop();
            renderMenu(previousState, true);
        }
    };

    const renderMenu = (items, isBack = false) => {
        if (!isBack && terminalMenu.children.length > 0) {
        }

        terminalMenu.innerHTML = '';

        items.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("terminal-item");
            div.id = item.menuItemID;
            div.textContent = `${item.menuItemLabel}`;

            if (item.menuItemType === 'menu') {
                div.classList.add("terminal-item");
                div.addEventListener('click', () => {
                    itemHistory.push(items);
                    renderMenu(item.menuItemContent);
                });
            } else if (item.menuItemType === 'file') {
                div.addEventListener('click', () => {
                    itemHistory.push(items);
                    updateStatus("Data downloaded to local device", 4000);
                });                
            } else if (item.menuItemType === 'media') {
                div.addEventListener('click', () => {
                    itemHistory.push(items);
                    terminalMenu.style.display = 'none';
                    contentViewer.style.display = 'flex';
                    contentViewer.textContent = '';
                    renderContent(item.menuItemContent);
                });
            } else {
                div.addEventListener('click', () => {
                    updateStatus("This file's format is unreadable", 4000);
                });
            }

            terminalMenu.appendChild(div);  
        });

    }

    const renderContent = async (path) => {
        if (!path) {
            updateStatus("[0x07F6BAAC] Bad data, cannot read", 4000);
            return;
        }

        try {
            const response = await fetch(path, { cache: "no-store" });

            if (!response.ok || response.headers.get("content-type")?.includes("text/html")) {
                throw new Error("INVALID_ACCESS_RESTRICTED");
            }

            contentViewer.innerText = await response.text();
        } catch (err) {
            console.error("Terminal Error:", err);
            updateStatus("[0x07F6BAAC] Bad data, cannot read", 4000);
        }
    }

    const init = async (url) => {
        try {
            const res = await (fetch(url));
            if (!res.ok) throw new Error();

            const data = await res.json();
            updateHeader(data.terminalHeader);
            renderMenu(data.menuItemContent);
            updateStatus("File system found. Please stand by...", 4000);
        } catch (error) {
            console.error(error);
            statusMessage.innerHTML = "File system not found. Please contact system administrator";
        }
    };

    init(fs);