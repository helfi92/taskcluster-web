import { createMuiTheme } from '@material-ui/core/styles';
import { fade, lighten } from '@material-ui/core/styles/colorManipulator';
import transitions from '@material-ui/core/styles/transitions';
import red from '@material-ui/core/colors/red';
import amber from '@material-ui/core/colors/amber';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';
import { THEME } from './utils/constants';

const SPACING = {
  UNIT: 8,
  DOUBLE: 16,
  TRIPLE: 24,
  QUAD: 32,
};
const Roboto300 = { fontFamily: 'Roboto300, sans-serif' };
const Roboto400 = { fontFamily: 'Roboto400, sans-serif' };
const Roboto500 = { fontFamily: 'Roboto500, sans-serif' };
const success = {
  main: green[500],
  dark: green[700],
};
const warning = {
  main: amber[500],
  dark: amber[700],
  light: amber[200],
  contrastText: 'rgba(0, 0, 0, 0.87)',
};
const error = {
  main: red[500],
  dark: red[700],
  light: red[300],
};
const createTheme = isDarkTheme => {
  const primaryMain = isDarkTheme ? THEME.PRIMARY_DARK : THEME.PRIMARY_LIGHT;
  const textPrimary = isDarkTheme
    ? THEME.PRIMARY_TEXT_DARK
    : THEME.PRIMARY_TEXT_LIGHT;
  const textSecondary = isDarkTheme
    ? THEME.SECONDARY_TEXT_DARK
    : THEME.SECONDARY_TEXT_LIGHT;
  const textHint = isDarkTheme
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(0, 0, 0, 0.5)';
  const backgroundPaper = THEME.WHITE;
  const TYPOGRAPHY = {
    H1: Roboto300,
    H2: Roboto400,
    H3: Roboto400,
    H4: Roboto400,
    H5: Roboto400,
    H6: Roboto500,
    SUBTITLE1: Roboto400,
    BODY1: Roboto500,
    BODY2: Roboto400,
    CAPTION: Roboto400,
    BUTTON: Roboto500,
  };
  const FONT_WEIGHTS = {
    LIGHT: 300,
    REGULAR: 400,
    MEDIUM: 500,
  };

  return {
    palette: {
      type: isDarkTheme ? 'dark' : 'light',
      background: {
        default: isDarkTheme ? THEME.DARK_THEME_BACKGROUND : '#fff',
        paper: backgroundPaper,
      },
      primary: {
        main: primaryMain,
      },
      secondary: {
        main: THEME.SECONDARY,
      },
      error: {
        ...red,
        ...error,
      },
      success: {
        ...green,
        ...success,
      },
      warning: {
        ...amber,
        ...warning,
      },
      info: {
        ...blue,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
        disabled: isDarkTheme
          ? 'rgba(255, 255, 255, 0.5)'
          : 'rgba(0, 0, 0, 0.5)',
        hint: textHint,
        icon: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        active: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        inactive: isDarkTheme
          ? 'rgba(255, 255, 255, 0.4)'
          : 'rgba(0, 0, 0, 0.4)',
      },
    },
    typography: {
      useNextVariants: true,
      ...Roboto400,
      h1: TYPOGRAPHY.H1,
      h2: TYPOGRAPHY.H2,
      h3: TYPOGRAPHY.H3,
      h4: TYPOGRAPHY.H4,
      h5: TYPOGRAPHY.H5,
      h6: TYPOGRAPHY.H6,
      subtitle1: TYPOGRAPHY.SUBTITLE1,
      body1: TYPOGRAPHY.BODY1,
      body2: TYPOGRAPHY.BODY2,
      caption: TYPOGRAPHY.CAPTION,
      button: TYPOGRAPHY.BUTTON,
      fontWeightLight: FONT_WEIGHTS.LIGHT,
      fontWeightRegular: FONT_WEIGHTS.REGULAR,
      fontWeightMedium: FONT_WEIGHTS.MEDIUM,
    },
    spacing: {
      unit: SPACING.UNIT,
      double: SPACING.DOUBLE,
      triple: SPACING.TRIPLE,
      quad: SPACING.QUAD,
    },
    drawerWidth: THEME.DRAWER_WIDTH,
    docsDrawerWidth: THEME.DRAWER_WIDTH + 125,
    mixins: {
      highlight: {
        fontFamily: 'Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace',
        backgroundColor: isDarkTheme
          ? THEME.TEN_PERCENT_WHITE
          : THEME.TEN_PERCENT_BLACK,
        border: `1px solid ${
          isDarkTheme ? THEME.TEN_PERCENT_WHITE : THEME.TEN_PERCENT_BLACK
        }`,
        borderRadius: 2,
        paddingLeft: 4,
        paddingRight: 4,
      },
      listItemButton: {
        '& svg': {
          transition: transitions.create('fill'),
          fill: lighten(
            isDarkTheme ? THEME.PRIMARY_TEXT_LIGHT : THEME.PRIMARY_TEXT_LIGHT,
            0.4
          ),
        },
        '&:hover svg': {
          fill: textPrimary,
        },
      },
      hover: {
        '&:hover': {
          textDecoration: 'none',
          backgroundColor: fade(textPrimary, 0.08),
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            backgroundColor: 'transparent',
          },
          '&$disabled': {
            backgroundColor: 'transparent',
          },
        },
      },
      fab: {
        position: 'fixed',
        bottom: 16,
        right: 24,
        '& .mdi-icon': {
          fill: 'white',
        },
      },
      fabIcon: {
        '& .mdi-icon': {
          fill: 'white',
        },
      },
      secondaryIcon: {
        backgroundColor: THEME.SECONDARY,
        '&:hover': {
          backgroundColor: fade(THEME.SECONDARY, 0.9),
        },
        '& svg': {
          backgroundColor: 'transparent',
        },
      },
      successIcon: {
        backgroundColor: success.main,
        '&:hover': {
          backgroundColor: success.dark,
        },
        '& svg': {
          backgroundColor: 'transparent',
        },
      },
      warningIcon: {
        backgroundColor: warning.main,
        '&:hover': {
          backgroundColor: warning.dark,
        },
        '& svg': {
          backgroundColor: 'transparent',
        },
      },
      errorIcon: {
        backgroundColor: error.main,
        '&:hover': {
          backgroundColor: error.dark,
        },
        '& svg': {
          backgroundColor: 'transparent',
        },
      },
      unorderedList: {
        listStyleType: 'square',
        paddingLeft: 32,
      },
      markdown: {
        fontFamily: Roboto400,
        color: textPrimary,
        '& pre, & pre[class*="language-"]': {
          margin: `${SPACING.TRIPLE}px 0`,
          padding: '12px 18px',
          backgroundColor: THEME.PRIMARY_DARK,
          borderRadius: 3,
          overflow: 'auto',
        },
        '& code': {
          display: 'inline-block',
          lineHeight: 1.6,
          fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
          color: textPrimary,
          fontSize: 14,
          '&[class*="language-"]': {
            textShadow: 'none',
          },
        },
        '& p code, & ul code, & pre code': {
          fontSize: 14,
          lineHeight: 1.6,
        },
        '& h1': {
          ...TYPOGRAPHY.H3,
          color: textSecondary,
          margin: '0.7em 0',
        },
        '& h2': {
          ...TYPOGRAPHY.H4,
          color: textSecondary,
          margin: '1em 0 0.7em',
        },
        '& h3': {
          ...TYPOGRAPHY.H5,
          color: textSecondary,
          margin: '1em 0 0.7em',
        },
        '& h4': {
          ...TYPOGRAPHY.H6,
          color: textSecondary,
          margin: '1em 0 0.7em',
        },
        '& p, & ul, & ol': {
          lineHeight: 1.6,
        },
        '& h1, & h2, & h3, & h4': {
          '& code': {
            fontSize: 'inherit',
            lineHeight: 'inherit',
            // Remove scroll on small screens.
            wordBreak: 'break-word',
          },
          '& .anchor-link-style': {
            opacity: 0,
            // To prevent the link to get the focus.
            display: 'none',
          },
          '&:hover .anchor-link-style': {
            display: 'inline-block',
            opacity: 1,
            padding: `0 ${SPACING.UNIT}px`,
            color: textHint,
            '&:hover': {
              color: textSecondary,
            },
            '& svg': {
              width: '0.55em',
              height: '0.55em',
              fill: 'currentColor',
            },
          },
        },
        '& table': {
          width: '100%',
          display: 'block',
          overflowX: 'auto',
          borderCollapse: 'collapse',
          borderSpacing: 0,
          overflow: 'hidden',
          '& .prop-name': {
            fontSize: 13,
            fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
          },
          '& .required': {
            color: isDarkTheme ? '#9bc89b' : '#006500',
          },
          '& .prop-type': {
            fontSize: 13,
            fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
            color: isDarkTheme ? '#dbb0d0' : '#932981',
          },
          '& .prop-default': {
            fontSize: 13,
            fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
            borderBottom: `1px dotted ${textHint}`,
          },
        },
        '& thead': {
          fontSize: 14,
          fontWeight: FONT_WEIGHTS.MEDIUM,
          color: textSecondary,
        },
        '& tbody': {
          fontSize: 14,
          lineHeight: 1.5,
          color: textPrimary,
        },
        '& td': {
          borderBottom: `1px solid ${THEME.DIVIDER}`,
          padding: `${SPACING.UNIT}px ${SPACING.DOUBLE}px ${SPACING.UNIT}px ${
            SPACING.UNIT
          }px`,
          textAlign: 'left',
        },
        '& td:last-child': {
          paddingRight: SPACING.TRIPLE,
        },
        '& td compact': {
          paddingRight: SPACING.TRIPLE,
        },
        '& td code': {
          fontSize: 13,
          lineHeight: 1.6,
        },
        '& th': {
          whiteSpace: 'pre',
          borderBottom: `1px solid ${THEME.DIVIDER}`,
          fontWeight: FONT_WEIGHTS.MEDIUM,
          padding: `0 ${SPACING.DOUBLE}px 0 ${SPACING.UNIT}px`,
          textAlign: 'left',
        },
        '& th:last-child': {
          paddingRight: SPACING.TRIPLE,
        },
        '& tr': {
          height: 48,
        },
        '& thead tr': {
          height: 64,
        },
        '& strong': {
          fontWeight: FONT_WEIGHTS.MEDIUM,
        },
        '& blockquote': {
          borderLeft: `5px solid ${textHint}`,
          backgroundColor: THEME.PRIMARY_DARK,
          padding: `${SPACING.UNIT / 2}px ${SPACING.TRIPLE}px`,
          margin: `${SPACING.TRIPLE}px 0`,
        },
        '& a, & a code': {
          // Style taken from the Link component
          color: THEME.SECONDARY,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& img': {
          maxWidth: '100%',
        },
      },
    },
    overrides: {
      MuiPaper: {
        root: {
          backgroundColor: primaryMain,
        },
      },
      MuiButton: {
        sizeSmall: {
          minWidth: 36,
        },
      },
      MuiFab: {
        sizeSmall: {
          minWidth: 36,
        },
        extended: {
          height: 36,
        },
      },
      MuiCircularProgress: {
        colorPrimary: {
          color: isDarkTheme ? THEME.PRIMARY_LIGHT : THEME.PRIMARY_DARK,
        },
      },
      MuiMobileStepper: {
        dotActive: {
          backgroundColor: isDarkTheme ? 'white' : '#000',
        },
      },
      MuiTableCell: {
        root: {
          borderBottom: `1px solid ${
            isDarkTheme ? THEME.TEN_PERCENT_WHITE : THEME.TEN_PERCENT_BLACK
          }`,
          whiteSpace: 'nowrap',
        },
      },
      MuiPickersYear: {
        root: {
          '&:focus': {
            color: isDarkTheme ? 'white' : '#000',
          },
        },
        selected: {
          color: isDarkTheme ? 'white' : '#000',
        },
      },
      MuiPickersDay: {
        selected: {
          backgroundColor: THEME.SECONDARY,
        },
        current: {
          color: isDarkTheme ? 'white' : '#000',
        },
      },
      MuiPickersModal: {
        dialogAction: {
          color: isDarkTheme ? 'white' : '#000',
          '&:hover': {
            backgroundColor: isDarkTheme
              ? THEME.TEN_PERCENT_WHITE
              : THEME.TEN_PERCENT_BLACK,
          },
        },
      },
    },
  };
};

const theme = createMuiTheme(createTheme(true));

export default {
  lightTheme: createMuiTheme(createTheme(false)),
  darkTheme: theme,
  styleguide: {
    StyleGuide: {
      root: {
        overflowY: 'scroll',
        minHeight: '100vh',
        backgroundColor: THEME.DARK_THEME_BACKGROUND,
        color: theme.palette.text.primary,
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
      border: THEME.DIVIDER,
      baseBackground: THEME.DARK_THEME_BACKGROUND,
      sidebarBackground: theme.palette.primary.main,
      codeBackground: theme.palette.primary.main,
    },
    sidebarWidth: THEME.DRAWER_WIDTH,
    maxWidth: '100vw',
  },
};
