import { createTheme } from '@mui/material/styles';

const POS_FONT =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

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
      fontFamily: POS_FONT,
      fontSize: 15,
      body1: { fontSize: '1rem', lineHeight: 1.5 },   // 16px – table body, inputs
      body2: { fontSize: '0.9375rem', lineHeight: 1.43 }, // 15px
      subtitle1: { fontSize: '1rem', fontWeight: 600 }, // 16px – section headings
      subtitle2: { fontSize: '0.9375rem', fontWeight: 600 }, // 15px
      caption: { fontSize: '0.875rem', lineHeight: 1.43 },   // 14px – hints, labels
      h4: { fontFamily: POS_FONT, fontWeight: 700, fontSize: '1.5rem' },
      h5: { fontFamily: POS_FONT, fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontFamily: POS_FONT, fontWeight: 600, fontSize: '1.0625rem' }, // 17px – section headings
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: POS_FONT,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem', // 15px
          },
          sizeMedium: { minHeight: 44, padding: '10px 16px' },
          sizeLarge: { minHeight: 48, padding: '12px 20px', fontSize: '1rem' },
          sizeSmall: { minHeight: 40, padding: '6px 12px', fontSize: '0.875rem' },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: { fontFamily: POS_FONT },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: { fontFamily: POS_FONT },
          input: { fontSize: '0.9375rem', boxSizing: 'border-box' },
          inputSizeSmall: { fontSize: '0.9375rem' },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { fontFamily: POS_FONT, fontSize: '0.9375rem' },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { fontFamily: POS_FONT, fontSize: '0.9375rem', fontWeight: 600, minHeight: 44 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { fontFamily: POS_FONT, fontSize: '0.9375rem' },
          head: { fontSize: '0.9375rem', fontWeight: 600 },
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
