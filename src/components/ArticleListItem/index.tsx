import { Link } from "gatsby"
import React from "react"
import styled from "styled-components"
import { mainColor, grayColor } from "../../utils/color"
import { rhythm } from "../../utils/typography"

type Props = {
  className?: string
  fields: {
    slug: string
  }
  frontmatter: {
    title: string
    date: string
  }
  excerpt: string
}

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
    color: ${mainColor.normal};
    text-decoration: none;
  }
  & > header small {
    color: ${grayColor.dark};
  }
`
