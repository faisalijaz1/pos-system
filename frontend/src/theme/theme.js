import { createTheme } from '@mui/material/styles';

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#818cf8' : '#4f46e5',
        light: '#a5b4fc',
        dark: '#3730a3',
      },
      secondary: {
        main: mode === 'dark' ? '#34d399' : '#059669',
      },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-input[type="date"]::-webkit-calendar-picker-indicator': {
              opacity: 1,
              ...(mode === 'dark' && { filter: 'invert(1)' }),
            },
            '& .MuiInputBase-input[type="time"]::-webkit-calendar-picker-indicator': {
              opacity: 1,
              ...(mode === 'dark' && { filter: 'invert(1)' }),
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.2)'
              : '0 4px 24px rgba(0,0,0,0.06)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
    },
  });

export default getTheme;
