import React from "react"
import styled from "styled-components"
import { ArticleDate } from "../../components/ArticleDate"
import { Tags } from "../../components/Tags"
import { MarkdownRemark } from "../../types/article"
import { grayColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"

type Props = {
  className?: string
  post: Pick<
    MarkdownRemark<"title" | "published" | "updated" | "tags">,
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
        {post.frontmatter.tags ? <Tags tags={post.frontmatter.tags} /> : null}
      </header>
      <main dangerouslySetInnerHTML={{ __html: post.html }} />
      <hr />
      <footer></footer>
    </article>
  )
}

export const Article = styled(ArticleInner)`
  & > header > h1 {
    margin: 0 0 ${rhythm(0.25)};
  }

  & > header > p {
    display: block;
    ${scale(-0.25)};
    margin-bottom: ${rhythm(0.5)};
    color: ${grayColor.darker};
  }

  & > header > div {
    display: flex;
    flex-flow: row nowrap;

    & > ul {
      display: flex;
      flex-flow: row wrap;
      margin: 0;
    }
  }

  & > hr {
    margin-bottom: ${rhythm(1)};
  }
`
