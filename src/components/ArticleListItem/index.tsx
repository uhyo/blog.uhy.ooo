import { Link } from "gatsby"
import React from "react"
import styled from "styled-components"
import { MarkdownRemark } from "../../types/article"
import { grayColor } from "../../utils/color"
import { rhythm } from "../../utils/typography"
import { ArticleDate } from "../ArticleDate"

type Props = {
  className?: string
} & Pick<
  MarkdownRemark<"title" | "published" | "updated">,
  "fields" | "frontmatter" | "excerpt"
>

const ArticleListItemInner: React.FC<Props> = ({
  className,
  fields,
  frontmatter,
  excerpt,
}) => {
  const title = frontmatter.title || fields.slug
  return (
    <article className={className}>
      <header>
        <h3>
          <Link to={fields.slug}>{title}</Link>
        </h3>
        <div>
          <small>
            <ArticleDate {...frontmatter} />
          </small>
        </div>
      </header>
      <section>
        <p>{excerpt}</p>
      </section>
    </article>
  )
}

export const ArticleListItem = styled(ArticleListItemInner)`
  & > header > h3 {
    margin-bottom: ${rhythm(0.25)};
  }
  & > header a {
    text-decoration: none;
  }
  & > header small {
    color: ${grayColor.darker};
  }
`
