
    export const widgetContainer = document.querySelector(".widget-container");

    export const widgetRegistry = {
        userDetails: (data, config) => userDetails(data, config),
        clockWidget: (data, config) => clockWidget(data, config),
        textWidget: (data, config) => textWidget(data, config)
    }

    export const loadWidgets = (widgetList, mainData, widgetSettings) => {
        widgetContainer.innerHTML = '';

        widgetList.forEach(widgetItem => {
            const div = document.createElement("div");
            div.classList.add("widget");

            if (!widgetItem) {
                div.classList.add("empty-widget");
                widgetContainer.appendChild(div);
                return;
            }

            const widgetFunction = widgetRegistry[widgetItem.type];
            const categorySettings = widgetSettings[widgetItem.type];
            const instanceSettings = categorySettings ? categorySettings[widgetItem.id] : null;

            div.id = `${widgetItem.type}`;

            if (widgetFunction && instanceSettings) {
                const result = widgetFunction(mainData, instanceSettings);
                if (result instanceof HTMLElement) {
                    div.appendChild(result);
                } else {
                    div.textContent = result;
                }
            } else {
                div.classList.add("empty-widget");
                console.warn(`Missing data for: ${widgetItem.id}`);
            }

            widgetContainer.appendChild(div);
        });
    };

    export const userDetails = (mainData, instanceSettings) => {
        const dataKey = instanceSettings.source; 
        return mainData[dataKey] || "Data not found";
    };

    export const clockWidget = (_mainData, instanceSettings) => {
        const clockElement = document.createElement("span");
        const settings = instanceSettings || {};

        const formatters = {
            dayFormat: (now) => {
                const style = settings?.dayFormat; 
                const text = style ? now.toLocaleDateString('en-US', { weekday: style }) : null;
                if (!text) return null;
                
                const span = document.createElement("span");
                span.textContent = text;
                return span;
            },
            
            dateFormat: (now) => {
                const format = settings.dateFormat;
                const sep = settings.dateSeparator || "/";
                const customYear = settings.customYearStart;

                const monthLong = now.toLocaleDateString('en-US', { month: 'long' });
                const monthShort = now.toLocaleDateString('en-US', { month: 'short' });
                const d = String(now.getDate()).padStart(2, '0');
                const y = customYear !== undefined ? customYear : now.getFullYear();

                let text = "";
                switch (format) {
                    case 'long':  text = `${monthLong} ${d} ${y}`; break;
                    case 'short': text = `${monthShort} ${d} ${y}`; break;
                    case 'iso':   text = `${y}-${String(now.getMonth() + 1).padStart(2, '0')}-${d}`; break;
                    case 'custom': text = `${String(now.getMonth() + 1).padStart(2, '0')}${sep}${d}${sep}${y}`; break;
                    default: text = format ? now.toLocaleDateString() : null;
                }
                if (!text) return null;

                const span = document.createElement("span");
                span.textContent = text;
                return span;
            },

            clockFormat: (now) => {
                const format = settings?.timeFormat;
                if (!format) return null;

                const h24 = now.getHours();
                const h12 = h24 % 12 || 12;
                const mm = String(now.getMinutes()).padStart(2, '0');
                const ss = String(now.getSeconds()).padStart(2, '0');
                const tt = h24 >= 12 ? 'PM' : 'AM';

                let parts = [];
                switch (format) {
                    case 'hh:mm:ss': parts = [String(h12).padStart(2, '0'), ':', mm, ':', ss]; break;
                    case 'hh:mm:tt': parts = [String(h12).padStart(2, '0'), ':', mm, ` ${tt}`]; break;
                    case 'HH:mm':    parts = [String(h24).padStart(2, '0'), ':', mm]; break;
                    case 'HH:mm:ss': parts = [String(h24).padStart(2, '0'), ':', mm, ':', ss]; break;
                    default: 
                        const defaultTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                        parts = defaultTime.split(/(:)/);
                }

                const container = document.createElement("span");
                
                const currentWindowSecond = now.getSeconds() % 3; 
                const isColonFaded = currentWindowSecond === 2;

                parts.forEach(part => {
                    const pSpan = document.createElement("span");
                    if (part === ':') {
                        pSpan.textContent = ':';
                        pSpan.style.transition = 'opacity 1s ease-in-out';
                        pSpan.style.display = 'inline-block'; 
                        pSpan.style.opacity = isColonFaded ? '0' : '1';
                    } else {
                        pSpan.textContent = part;
                    }
                    container.appendChild(pSpan);
                });

                return container;
            }
        };

        const updateTime = () => {
            const now = new Date();
            const formatOrder = settings?.widgetFormat?.length ? settings.widgetFormat : ['clockFormat'];
            const widgetSep = settings?.widgetSeparator || ", ";

            clockElement.innerHTML = "";

            const validElements = formatOrder
                .map(key => formatters[key]?.(now))
                .filter(val => val !== null && val !== undefined);

            if (validElements.length === 0) {
                clockElement.textContent = "No format selected";
                return;
            }

            validElements.forEach((element, index) => {
                clockElement.appendChild(element);
                if (index < validElements.length - 1) {
                    const sepSpan = document.createElement("span");
                    sepSpan.textContent = widgetSep;
                    clockElement.appendChild(sepSpan);
                }
            });
        };

        updateTime();
        setInterval(updateTime, 1000);
        return clockElement;
    };

    export const textWidget = (_mainData, instanceSettings) => {
        const content = instanceSettings?.content || instanceSettings?.text || "";
        return content;
    };
