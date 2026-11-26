export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      tel: { DEFAULT: '#C8102E', dark: '#8E0B20', soft: 'rgb(var(--soft) / <alpha-value>)' },
      ink: 'rgb(var(--ink) / <alpha-value>)', paper: 'rgb(var(--paper) / <alpha-value>)', surface: 'rgb(var(--surface) / <alpha-value>)', sun: '#F7C531' },
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] } } },
}
