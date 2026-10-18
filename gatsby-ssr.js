const React = require("react")
const typography = require("./src/utils/typography").default

// Replacement of gatsby-plugin-typography (which does not support React 19)
exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <style
      key="typography.js"
      id="typography.js"
      dangerouslySetInnerHTML={{ __html: typography.toString() }}
    />,
  ])
}

// Put typography styles first so that other styles can override them
exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents()
  const isTypography = c => c && c.key === "typography.js"
  replaceHeadComponents([
    ...headComponents.filter(isTypography),
    ...headComponents.filter(c => !isTypography(c)),
  ])
}
