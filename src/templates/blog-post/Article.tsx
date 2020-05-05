import React from "react"
import Bio from "../../components/bio"
import { MarkdownRemark } from "../../types/article"
import { rhythm, scale } from "../../utils/typography"
import styled from "styled-components"
import { grayColor } from "../../utils/color"
import { ArticleDate } from "../../components/ArticleDate"

type Props = {
  className?: string
  post: Pick<
    MarkdownRemark<"title" | "published" | "updated">,
    "frontmatter" | "html"
  >
}

const ArticleInner: React.FC<Props> = ({ className, post }) => {
  return (
    <article className={className}>
      <header>
        <h1>{post.frontmatter.title}</h1>
        <p>
          <ArticleDate {...post.frontmatter} />
        </p>
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
    margin: ${rhythm(1)} 0 ${rhythm(0.25)};
  }

  & > header > p {
    display: block;
    ${scale(-0.25)};
    margin-bottom: ${rhythm(0.5)};
    color: ${grayColor.darker};
  }

  & > hr {
    margin-bottom: ${rhythm(1)};
  }
`
