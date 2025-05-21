import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      success: string;
      danger: string;
      white: string;
      gray: string;
      lightGray: string;
    };
    fonts: {
      main: string;
    };
    breakpoints: {
      mobile: string;
    };
    borderRadius: string;
    boxShadow: string;
    transition: string;
  }
} 