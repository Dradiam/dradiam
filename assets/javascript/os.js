
    import * as widgetLoader from './widgets.js';
    
    const curacc = 'accounts/main.json';
    const statusMessage = document.querySelector(".status-message");
    const terminalMenu = document.querySelector(".terminal-menu");
    const contentViewer = document.querySelector(".content-viewer");
    let itemHistory = [];

    contentViewer.addEventListener('click', (e) => {
        if (e.target.classList.contains("content-viewer")) handleBack();
    });

    terminalMenu.addEventListener('click', (e) => {
        if (e.target === terminalMenu) handleBack();
    });


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

    const init = async (acc) => {
        try {
            const accres = await (fetch(acc));
            if (!accres.ok) throw new Error("Account file not found.");
            const accdata = await accres.json();

            itemHistory = [];
            terminalMenu.innerHTML = '';
            terminalMenu.style.display = 'flex';
            contentViewer.style.display = 'none';
            contentViewer.textContent = '';
            
            const fsurl = accdata.fs.menuItemContent;
            const widgets = accdata.widgetSettings.widgetList;
            
            widgetLoader.loadWidgets(widgets, accdata.main, accdata.widgetSettings);
            renderMenu(fsurl);
            updateStatus("File system found. Please stand by...", 4000);
        } catch (error) {
            console.error(error);
            statusMessage.innerHTML = "File system not found. Please contact system administrator";
        }
    };

    const tempchangefs = (() => {
        const DIRECTORY_PATH = './accounts/';
        const DEFAULT_FILE = 'main';

        const promptForAccount = async () => {
            let fileName = prompt("Please enter the account name you want to access:", DEFAULT_FILE);
            
            if (fileName === null) return;
            if (fileName.trim() === "") fileName = DEFAULT_FILE;
            
            if (!fileName.endsWith('.json')) fileName;
            
            const fullPath = `${DIRECTORY_PATH}${fileName}.json`;

            try {
                const check = await fetch(fullPath, { method: 'HEAD' });
                if (!check.ok) throw new Error(`The account '${fileName}' is not listed.`);

                await init(fullPath);
            } catch (error) {
                console.error("Directory/File Error:", error.message);
                alert(`Error: ${error.message}`);
            }
        };

        const onKeyPress = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === '/') {
                e.preventDefault();
                promptForAccount();
            }
        };

        window.addEventListener('keydown', onKeyPress);
        return () => window.removeEventListener('keydown', onKeyPress);

    })();

    init(curacc);
