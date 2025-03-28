import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
      light: '#33ff33',
      dark: '#00cc00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#ffffff',
            },
            '&:hover fieldset': {
              borderColor: '#ffffff',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderColor: '#ffffff',
          '&:hover': {
            borderColor: '#ffffff',
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
          },
        },
      },
    },
  },
});

export default theme;
