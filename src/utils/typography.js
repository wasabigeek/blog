import Typography from "typography"
import Kirkham from "typography-theme-kirkham"

delete Kirkham.googleFonts
Kirkham.overrideThemeStyles = ({ rhythm }, options, styles) => ({
  'h2,h3': {
    marginBottom: rhythm(1 / 2),
    marginTop: rhythm(2),
  },
  'table': {
    fontSize: '0.9rem',
    border: '1px solid hsla(0,0%,0%,0.12)',
    borderRadius: '5px'
  },
  'th': {
    backgroundColor: '#eef0f159',
  },
  'th, td': {
    paddingTop: '0.5rem',
    paddingBottom: 'calc(0.5rem - 1px)',
  },
  'th:first-child, td:first-child': {
    paddingLeft: '0.96rem'
  },
})


const typography = new Typography(Kirkham)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
