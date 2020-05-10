import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import styled, { createGlobalStyle } from "styled-components"
import { SiteMetadata } from "../../types/siteMetadata"
import { grayColor, mainColor, subColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"
import { Ad } from "./ad"
import "./fa-init"
import { Header } from "./header"
import { ShareButtons } from "./share"
import { mainAreaWidth, sideBarWidth } from "./width"

const GlobalStyle = createGlobalStyle`
  :root {
    --bg-color: white;
    --bg-light-color: ${grayColor.lightest};
    --fg-color: hsl(0, 0%, 0%, 0.8);
    --fg-demisub-color: hsl(0, 0%, 0%, 0.65);
    --fg-sub-color: hsl(0, 0%, 0%, 0.5);
    --fg-link-color: ${mainColor.normal};
    --fg-link-visited-color: ${subColor.normal};

    @media (prefers-color-scheme: dark) {
      --bg-color: ${grayColor.darkest};
      --bg-light-color: ${grayColor.darker};
      --fg-color: hsl(0, 100%, 100%, 0.9);
      --fg-demisub-color: hsl(0, 100%, 100%, 0.78);
      --fg-sub-color: hsl(0, 100%, 100%, 0.65);
      --fg-link-color: ${mainColor.light};
      --fg-link-visited-color: ${subColor.light};
    }
  }

  body {
    background-color: var(--bg-light-color);
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${mainColor.dark};

    @media (prefers-color-scheme: dark) {
      color: var(--fg-color);
    }
  }

  a {
    color: var(--fg-link-color);
  }

  a:visited {
    color: var(--fg-link-visited-color);
  }
  /* prismjs */
  .gatsby-highlight {
    background-color: #2f2f2f;
    border-radius: 0.3em;
    margin: ${rhythm(1)} 0;
    padding-left: 0.5em;
    overflow: auto;
  }

  @media (max-width: 640px) {
    .gatsby-highlight {
      ${scale(-0.25)}
    }
  }

  .gatsby-highlight pre[class*="language-"].line-numbers {
    padding: 0;
    padding-left: 2.8em;
    overflow: initial;
  }

  .gatsby-code-title {
    display: block;
    background: #2f2f2f;
    width: 100%;
    border-top-left-radius: 0.3em;
    border-top-right-radius: 0.3em;
    overflow: hidden;
    margin-top: ${rhythm(1)};
  }

  .gatsby-code-title span {
    display: inline-block;
    height: calc(${rhythm(1)} - 3px);
    position: relative;
    color: ${grayColor.lightest};
    background: ${grayColor.darker};
    border-top-left-radius: 0.3em;
    border-bottom-right-radius: 0.3em;
    padding: 0 4px 4px 4px;
    top: -3px;
  }

  .gatsby-code-title + .gatsby-highlight {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    margin-top: 0;
  }
`

const LayoutStyle = styled.div`
  display: grid;
  grid-template-areas:
    "left header ."
    "left main   right"
    "left footer right";
  grid-template-rows: max-content max-content auto;
  grid-template-columns: 0 100% 0;
  max-width: ${rhythm(mainAreaWidth)};
  @media (min-width: ${rhythm(mainAreaWidth + sideBarWidth)}) {
    grid-template-columns: auto ${rhythm(mainAreaWidth)} ${rhythm(sideBarWidth)};
    max-width: none;
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
    background-color: var(--bg-color);
    color: var(--fg-color);
  }

  & > div:nth-of-type(2) {
    grid-area: right;

    @media (max-width: ${rhythm(mainAreaWidth + sideBarWidth)}) {
      display: none;
    }
  }

  & > footer {
    grid-area: footer;
    padding: ${rhythm(1)} ${rhythm(1)} ${rhythm(1)};
    background-color: var(--bg-color);
    color: var(--fg-demisub-color);
  }

  & > footer p {
    margin-bottom: ${rhythm(0.25)};
    ${scale(-0.25)};
    line-height: 1.25;
  }

  & > footer > aside {
    @media (min-width: ${rhythm(mainAreaWidth + sideBarWidth)}) {
      display: none;
    }
  }

  & > footer > div:first-child {
    margin-bottom: ${rhythm(0.25)};
  }

  & > footer > div:last-child {
    margin-top: ${rhythm(3 / 8)};
  }
`

type Props = {
  rightSide?: JSX.Element
  title?: string
  slug?: string
}
const Layout: React.FC<Props> = ({ rightSide, title, slug, children }) => {
  const { site } = useStaticQuery<{
    site: {
      siteMetadata: Pick<SiteMetadata, "title" | "siteUrl">
    }
  }>(
    graphql`
      query {
        site {
          siteMetadata {
            title
            siteUrl
          }
        }
      }
    `
  )

  const pageTitle = title
    ? `${title} - ${site.siteMetadata.title}`
    : site.siteMetadata.title
  const pageUrl = site.siteMetadata.siteUrl.replace(/\/$/, "") + slug

  return (
    <LayoutStyle>
      <GlobalStyle />
      <div>
        <Header title={site.siteMetadata.title} />
      </div>
      <main>{children}</main>
      <div>
        <Ad />
        {rightSide}
      </div>
      <footer>
        {title !== undefined && slug !== undefined && (
          <div>
            <ShareButtons text={pageTitle} url={pageUrl} />
          </div>
        )}
        <aside>
          <Ad />
        </aside>
        <div>
          <p>
            © {new Date().getFullYear()}, Built with
            {` `}
            <a rel="external" href="https://www.gatsbyjs.org">
              Gatsby
            </a>
          </p>
          <p>
            このサイトはGoogle Analyticsを使用しています。
            <a
              href="https://policies.google.com/technologies/partner-sites?hl=ja"
              target="_blank"
              rel="external noopener"
            >
              詳しく見る
            </a>
          </p>
        </div>
      </footer>
    </LayoutStyle>
  )
}

export default Layout
