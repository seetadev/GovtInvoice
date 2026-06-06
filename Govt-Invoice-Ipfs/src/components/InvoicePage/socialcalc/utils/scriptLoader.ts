export interface ScriptConfig {
    src: string;
}

export const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Maintain execution order

        script.onload = () => resolve();
        script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));

        document.body.appendChild(script);
    });
};

export const loadScriptsSequentially = async (scripts: ScriptConfig[]): Promise<void> => {
    for (const script of scripts) {
        await loadScript(script.src);
    }
};

export const loadStylesheets = (hrefs: string[]): void => {
    hrefs.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });
};
