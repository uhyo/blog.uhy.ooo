import React from "react"
import Bio from "../../components/bio"
import { MarkdownRemark } from "../../types/article"
import { rhythm, scale } from "../../utils/typography"
import styled from "styled-components"
import { grayColor } from "../../utils/color"

type Props = {
  className?: string
  post: Pick<MarkdownRemark<"title" | "date">, "frontmatter" | "html">
}

const ArticleInner: React.FC<Props> = ({ className, post }) => {
  return (
    <article className={className}>
      <header>
        <h1>{post.frontmatter.title}</h1>
        <p>{post.frontmatter.date}</p>
      </header>
      <section dangerouslySetInnerHTML={{ __html: post.html }} />
      <hr />
      <footer>
        <Bio />
      </footer>
    </article>
  )
}

export const Article = styled(ArticleInner)`
  & > header > h1 {
    margin-top: ${rhythm(1)};
    margin-bottom: 0;
  }
  & > header > p {
    display: block;
    margin-bottom: ${rhythm(1)};
    ${String(scale(1.5))};
    color: ${grayColor.dark};
  }

  & > hr {
    margin-bottom: ${rhythm(1)};
  }
`
