import React from "react"

import { rhythm, scale } from "../../utils/typography"
import styled from "styled-components"
import { Header } from "./header"

const LayoutStyle = styled.div`
  margin-left: auto;
  margin-right: auto;
  padding-bottom: ${rhythm(1)};
  max-width: ${rhythm(24)};
  min-height: 100vh;

  background-color: white;

  & > main {
    margin: ${rhythm(1)};
  }

  & > footer {
    margin: ${rhythm(2)} ${rhythm(1)} 0;
    color: hsl(0, 0%, 0%, 0.5);
    ${String(scale(-0.25))};
  }
`

type Props = {
  title: string
}
const Layout: React.FC<Props> = ({ title, children }) => {
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
