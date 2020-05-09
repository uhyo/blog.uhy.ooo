import styled from "styled-components"
import React from "react"
import { MarkdownRemark } from "../../types/article"
import { Link } from "gatsby"

type Props = {
  className?: string
  previous?: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
  next?: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
}

const NavInner: React.FunctionComponent<Props> = ({
  className,
  previous,
  next,
}) => {
  return (
    <nav className={className}>
      <ul>
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}

export const Nav = styled(NavInner)`
  & > ul {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    margin: 0;
    padding: 0;
    list-style: none;
  }
`
