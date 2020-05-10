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
        {post.frontmatter.tags ? (
          <div>
            <Tags tags={post.frontmatter.tags} />
          </div>
        ) : null}
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
    margin-bottom: 0;
    ${scale(-0.25)};
    color: var(--fg-demisub-color);
  }

  & > header > div {
    margin: ${rhythm(0.25)} 0;
  }

  & > main {
    margin-top: ${rhythm(0.5)};
  }

  & > hr {
    margin-bottom: ${rhythm(1)};
  }
`
