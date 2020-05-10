import Typography from "typography"
import { grayColor, mainColor, subColor } from "./color"

// Wordpress2016.overrideThemeStyles = () => {
//   return {
//     "a.gatsby-resp-image-link": {
//       boxShadow: `none`,
//     },
//   }
// }

// delete Wordpress2016.googleFonts

const theme = {
  baseFontSize: "16px",
  baseLineHeight: 1.75,
  scaleRatio: 2,
  headerFontFamily: ["sans-serif"],
  bodyFontFamily: ["sans-serif"],
  bodyColor: "hsl(0,0%,0%,0.8)",
}

const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
// Workaround for type/interface difference
export const scale = typography.scale as (
  value: number
) => { fontSize: string; lineHeight: string }
