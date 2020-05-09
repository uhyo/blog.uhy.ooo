import { Link, graphql } from "gatsby"
import React from "react"
import styled from "styled-components"
import { MarkdownRemark } from "../../types/article"
import { grayColor } from "../../utils/color"
import { rhythm } from "../../utils/typography"
import { ArticleDate } from "../ArticleDate"
import { Tags } from "../Tags"

type Props = {
  className?: string
} & Pick<
  MarkdownRemark<"title" | "published" | "updated" | "tags">,
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
          {frontmatter.tags ? (
            <div>
              <Tags tags={frontmatter.tags} scale={-0.25} />
            </div>
          ) : null}
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
  & > header > div {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    color: ${grayColor.darker};

    & > div {
      margin-left: ${rhythm(0.25)};
    }
  }
`

export const query = graphql`
  fragment ArticleInList on MarkdownRemark {
    excerpt
    fields {
      slug
    }
    frontmatter {
      published(formatString: "LL", locale: "ja")
      updated(formatString: "LL", locale: "ja")
      title
      tags
    }
  }
`
