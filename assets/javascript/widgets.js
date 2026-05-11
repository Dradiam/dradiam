
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
            return style ? now.toLocaleDateString('en-US', { weekday: style }) : null;
        },
        
       dateFormat: (now) => {
            const format = settings.dateFormat;
            const sep = settings.dateSeparator || "/";
            const customYear = settings.customYearStart;

            const monthLong = now.toLocaleDateString('en-US', { month: 'long' });
            const monthShort = now.toLocaleDateString('en-US', { month: 'short' });
            const d = String(now.getDate()).padStart(2, '0');
            const y = customYear !== undefined ? customYear : now.getFullYear();

            switch (format) {
                case 'long':  return `${monthLong} ${d} ${y}`;
                case 'short': return `${monthShort} ${d} ${y}`;
                case 'iso':   return `${y}-${String(now.getMonth() + 1).padStart(2, '0')}-${d}`;
                case 'custom': return `${String(now.getMonth() + 1).padStart(2, '0')}${sep}${d}${sep}${y}`;
                default: return format ? now.toLocaleDateString() : null;
            }
        },

        clockFormat: (now) => {
            const format = settings?.timeFormat;
            if (!format) return null;

            const h24 = now.getHours();
            const h12 = h24 % 12 || 12;
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            const tt = h24 >= 12 ? 'PM' : 'AM';

            switch (format) {
                case 'hh:mm:ss': return `${String(h12).padStart(2, '0')}:${mm}:${ss}`;
                case 'hh:mm:tt': return `${String(h12).padStart(2, '0')}:${mm} ${tt}`;
                case 'HH:mm':    return `${String(h24).padStart(2, '0')}:${mm}`;
                case 'HH:mm:ss': return `${String(h24).padStart(2, '0')}:${mm}:${ss}`;
                default: return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            }
        }
    };


        const updateTime = () => {
            const now = new Date();
            const formatOrder = settings?.widgetFormat?.length ? settings.widgetFormat : ['timeFormat'];
            const widgetSep = settings?.widgetSeparator || ", ";

            const segments = formatOrder
                .map(key => formatters[key]?.(now))
                .filter(val => val !== null && val !== undefined && val !== "");

            clockElement.textContent = segments.join(widgetSep) || "No format selected";
        };

        updateTime();
        setInterval(updateTime, 1000);
        return clockElement;
    };

    export const textWidget = (_mainData, instanceSettings) => {
        const content = instanceSettings?.content || instanceSettings?.text || "";
        return content;
    };