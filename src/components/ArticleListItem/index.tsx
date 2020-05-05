import { Link } from "gatsby"
import React from "react"
import styled from "styled-components"
import { MarkdownRemark } from "../../types/article"
import { grayColor, mainColor } from "../../utils/color"
import { rhythm } from "../../utils/typography"

type Props = {
  className?: string
} & Pick<MarkdownRemark<"title" | "date">, "fields" | "frontmatter" | "excerpt">

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
          <small>{frontmatter.date}</small>
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
    color: ${grayColor.dark};
  }
`
