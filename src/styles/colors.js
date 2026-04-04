const isWeb = typeof document !== 'undefined';

const varColor = (name, fallback) =>
  isWeb ? `var(${name}, ${fallback})` : fallback;

export const colors = {
    primary: varColor('--primary', '#28B34B'),
    secondary: varColor('--secondary', '#000000'),
    white: '#FFFFFF',
    background: varColor('--background', '#F8FAFC'),
    text: varColor('--text', '#0F172A'),
    textSecondary: varColor('--text-secondary', '#64748B'),
    border: varColor('--border', '#F1F5F9'),
    error: varColor('--negative', '#EF4444'),
    success: varColor('--positive', '#22C55E'),
    warning: varColor('--warning', '#F59E0B'),
    info: varColor('--info', '#3B82F6'),
};

export default colors;
