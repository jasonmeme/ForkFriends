import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    primary: '#4E6E81',
    secondary: '#FF9551',
    background: '#F9F9F9',
    text: '#333333',
    success: '#4CAF50',
    danger: '#F44336',
    white: '#FFFFFF',
    gray: '#E0E0E0',
    lightGray: '#F5F5F5',
  },
  fonts: {
    main: "'Poppins', sans-serif",
  },
  breakpoints: {
    mobile: '768px',
  },
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
};

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: ${theme.fonts.main};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  button {
    cursor: pointer;
    font-family: ${theme.fonts.main};
    border: none;
    outline: none;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
`; 