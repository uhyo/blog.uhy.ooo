import React from "react"

import { rhythm, scale } from "../../utils/typography"
import styled from "styled-components"
import { Header } from "./header"

const mainAreaWidth = 24
const sideBarWidth = 8

const LayoutStyle = styled.div`
  display: grid;
  grid-template-areas:
    "left header ."
    "left main   right"
    "left footer right";
  grid-template-rows: max-content max-content auto;
  grid-template-columns: 0 ${rhythm(mainAreaWidth)} 0;
  width: ${rhythm(mainAreaWidth)};
  @media (min-width: ${rhythm(mainAreaWidth + sideBarWidth)}) {
    grid-template-columns: auto ${rhythm(mainAreaWidth)} ${rhythm(sideBarWidth)};
    width: 100%;
  }
  @media (min-width: ${rhythm(mainAreaWidth + sideBarWidth * 2)}) {
    grid-template-columns: ${rhythm(sideBarWidth)} ${rhythm(mainAreaWidth)} ${rhythm(
        sideBarWidth
      )};
    width: ${rhythm(mainAreaWidth + sideBarWidth * 2)};
  }

  margin-left: auto;
  margin-right: auto;
  min-height: 100vh;

  & > div:nth-of-type(1) {
    grid-area: header;
  }

  & > main {
    grid-area: main;
    max-width: ${rhythm(mainAreaWidth)};
    padding: ${rhythm(1)};
    background-color: white;
  }

  & > div:nth-of-type(2) {
    grid-area: right;
  }

  & > footer {
    grid-area: footer;
    padding: ${rhythm(2)} ${rhythm(1)} ${rhythm(1)};
    background-color: white;
    color: hsl(0, 0%, 0%, 0.5);
    ${String(scale(-0.25))};
  }
`

type Props = {
  title: string
  rightSide?: JSX.Element
}
const Layout: React.FC<Props> = ({ title, rightSide, children }) => {
  return (
    <LayoutStyle>
      <div>
        <Header title={title} />
      </div>
      <main>{children}</main>
      <div>{rightSide}</div>
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
