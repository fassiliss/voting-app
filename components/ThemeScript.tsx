export default function ThemeScript() {
    const script = `
        try {
            const storedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = storedTheme || (prefersDark ? 'dark' : 'light');
            document.documentElement.dataset.theme = theme;
        } catch {
            document.documentElement.dataset.theme = 'dark';
        }
    `;

    return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
