import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../../utils/typography"
import styled from "styled-components"
import { Header } from "./header"

const LayoutStyle = styled.div`
  margin-left: auto;
  margin-right: auto;
  padding-bottom: ${rhythm(1)};
  max-width: ${rhythm(24)};

  background-color: white;

  & > main {
    margin: ${rhythm(1)};
  }

  & > footer {
    margin: ${rhythm(2)} ${rhythm(1)} 0;
    color: hsl(0, 0%, 0%, 0.5);
    ${scale(-0.25)};
  }
`

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1 style={scale(1.25)}>
        <Link
          style={{
            color: `inherit`,
            textDecoration: "none",
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          fontFamily: `Montserrat, sans-serif`,
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <LayoutStyle>
      <Header title={title} />
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a rel="external" href="https://www.gatsbyjs.org">
          Gatsby
        </a>
      </footer>
    </LayoutStyle>
  )
}

export default Layout
