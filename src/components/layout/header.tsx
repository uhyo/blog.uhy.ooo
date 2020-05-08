import { Link, useStaticQuery, graphql } from "gatsby"
import React from "react"
import styled from "styled-components"
import { mainColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type Props = {
  className?: string
  title: string
}

const HeaderInner: React.FC<Props> = ({ title, className }) => {
  const {
    site: {
      siteMetadata: { author, social },
    },
  } = useStaticQuery(graphql`
    query HeaderInnerQuery {
      site {
        siteMetadata {
          author {
            name
            url
          }
          social {
            twitter
            github
          }
        }
      }
    }
  `)

  return (
    <header className={className}>
      <h1>
        <Link to="/">{title}</Link>
      </h1>
      <nav>
        <a href="/rss.xml" aria-label="RSSフィード">
          <FontAwesomeIcon icon="rss" />
        </a>
        <a
          href={author.url}
          target="_blank"
          rel="external"
          aria-label={`${author.name}のTwitter`}
        >
          <FontAwesomeIcon icon="home" />
        </a>
        <a
          href={`https://github.com/${social.github}`}
          target="_blank"
          rel="external"
          aria-label={`${author.name}のGitHub`}
        >
          <FontAwesomeIcon icon={["fab", "github"]} />
        </a>
        <a
          href={`https://twitter.com/${social.twitter}`}
          target="_blank"
          rel="external"
          aria-label={`${author.name}のウェブサイト`}
        >
          <FontAwesomeIcon icon={["fab", "twitter"]} />
        </a>
      </nav>
    </header>
  )
}

export const Header = styled(HeaderInner)`
  display: flex;
  flex-flow: wrap row;
  align-items: flex-end;
  background-color: ${mainColor.normal};
  padding: ${rhythm(0.5)} ${rhythm(3 / 4)};

  & > h1 {
    flex: auto 1 1;
    font-family: "Source Code Pro";
    color: #ffffff;
    margin: 0;
    ${scale(1)}
  }

  & > nav {
    flex: auto 0 0;
    ${scale(0.5)}

    & > a {
      display: inline-block;
      margin: 0 ${rhythm(1 / 4)};
    }
  }

  a {
    color: #ffffff;
    text-decoration: none;
  }
`
