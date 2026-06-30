import { createTheme } from '@mui/material';

// Цветовая палитра
export const colors = {
    deepBlue: '#003366',
    red: '#E30613',
    steel: '#A6A6A6',
    white: '#FFFFFF',
};

export const theme = createTheme({
    palette: {
        primary: {
            main: colors.deepBlue,
            contrastText: colors.white,
        },
        secondary: {
            main: colors.red,
            contrastText: colors.white,
        },
        background: {
            default: '#f5f5f5',
            paper: colors.white,
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#666666',
        },
        divider: '#e0e0e0',
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.deepBlue,
                    borderRadius: 0,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                elevation1: {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 51, 102, 0.12)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 51, 102, 0.18)',
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                },
                colorPrimary: {
                    backgroundColor: colors.deepBlue,
                    color: colors.white,
                },
                colorSecondary: {
                    backgroundColor: colors.red,
                    color: colors.white,
                },
            },
        },
    },
});

export default theme;