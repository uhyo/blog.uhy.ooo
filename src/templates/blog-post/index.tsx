import { graphql, Link } from "gatsby"
import React from "react"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import { MarkdownRemark } from "../../types/article"
import { SiteMetadata } from "../../types/siteMetadata"
import { Article } from "./Article"

type Props = {
  data: {
    site: {
      siteMetadata: Pick<SiteMetadata, "title">
    }
    markdownRemark: MarkdownRemark<"title" | "published" | "updated">
  }
  pageContext: {
    previous: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
    next: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
  }
}

const BlogPostTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  return (
    <Layout title={siteTitle}>
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      <Article post={post} />
      <nav>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
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
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        published(formatString: "LL", locale: "ja")
        updated(formatString: "LL", locale: "ja")
      }
    }
  }
`
