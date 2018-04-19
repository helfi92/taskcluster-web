import { createMuiTheme } from 'material-ui/styles';
import { fade } from 'material-ui/styles/colorManipulator';
import red from 'material-ui/colors/red';
import amber from 'material-ui/colors/amber';
import blue from 'material-ui/colors/blue';
import green from 'material-ui/colors/green';

const Roboto300 = { fontFamily: 'Roboto300, sans-serif' };
const Roboto400 = { fontFamily: 'Roboto400, sans-serif' };
const Roboto500 = { fontFamily: 'Roboto500, sans-serif' };
const TEN_PERCENT_WHITE = fade('#fff', 0.1);
const BACKGROUND = '#12202c';
const PRIMARY = '#1b2a39';
const SECONDARY = '#4177a5';
const theme = createMuiTheme({
  palette: {
    type: 'dark',
    background: BACKGROUND,
    primary: {
      main: PRIMARY,
    },
    secondary: {
      main: SECONDARY,
    },
    error: {
      ...red,
    },
    success: {
      ...green,
      main: green[500],
      dark: green[800],
    },
    warning: {
      ...amber,
      light: amber[200],
      main: amber[500],
      dark: amber[700],
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      ...blue,
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      hint: 'rgba(255, 255, 255, 0.5)',
      icon: 'rgba(255, 255, 255, 0.5)',
      active: 'rgba(255, 255, 255, 0.12)',
      inactive: 'rgba(255, 255, 255, 0.3)',
    },
  },
  typography: {
    ...Roboto400,
    display4: Roboto300,
    display3: Roboto400,
    display2: Roboto400,
    display1: Roboto400,
    headline: Roboto400,
    title: Roboto500,
    subheading: Roboto400,
    body2: Roboto500,
    body1: Roboto400,
    caption: Roboto400,
    button: Roboto500,
  },
  spacing: {
    unit: 8,
    double: 16,
    triple: 24,
    quad: 32,
  },
  drawerWidth: 240,
  mixins: {
    highlight: {
      fontFamily: 'Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace',
      backgroundColor: TEN_PERCENT_WHITE,
      border: `1px solid ${TEN_PERCENT_WHITE}`,
      borderRadius: 2,
      paddingLeft: 4,
      paddingRight: 4,
    },
  },
  overrides: {
    MuiPaper: {
      root: {
        backgroundColor: PRIMARY,
      },
    },
    MuiButton: {
      sizeSmall: {
        minWidth: 36,
      },
    },
    MuiCircularProgress: {
      colorPrimary: {
        color: 'white',
      },
    },
    MuiMobileStepper: {
      dotActive: {
        backgroundColor: 'white',
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: `1px solid ${TEN_PERCENT_WHITE}`,
        whiteSpace: 'nowrap',
      },
    },
  },
});

export default {
  ...theme,
  styleguide: {
    StyleGuide: {
      root: {
        overflowY: 'scroll',
        minHeight: '100vh',
        backgroundColor: BACKGROUND,
      },
    },
    fontFamily: {
      base: theme.typography.fontFamily,
    },
    fontSize: {
      base: theme.typography.fontSize - 1,
      text: theme.typography.fontSize,
      small: theme.typography.fontSize - 2,
    },
    color: {
      base: theme.palette.text.primary,
      link: theme.palette.text.primary,
      linkHover: theme.palette.text.primary,
      border: theme.palette.divider,
      baseBackground: BACKGROUND,
      sidebarBackground: theme.palette.primary.main,
      codeBackground: theme.palette.primary.main,
    },
    sidebarWidth: theme.drawerWidth,
    maxWidth: '100vw',
  },
};
