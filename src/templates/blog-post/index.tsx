import { graphql, Link } from "gatsby"
import React from "react"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import { MarkdownRemark } from "../../types/article"
import { SiteMetadata } from "../../types/siteMetadata"
import { Article } from "./Article"
import { TOC } from "./TOC"
import { Nav } from "./Nav"

type Props = {
  data: {
    site: {
      siteMetadata: Pick<SiteMetadata, "title">
    }
    markdownRemark: MarkdownRemark<"title" | "published" | "updated">
  }
  pageContext: {
    previous?: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
    next?: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
  }
}

const BlogPostTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  return (
    <Layout
      title={siteTitle}
      rightSide={<TOC tableOfContents={post.tableOfContents} />}
    >
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      <Article post={post} />
      <Nav previous={previous} next={next} />
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
      tableOfContents
      frontmatter {
        title
        published(formatString: "LL", locale: "ja")
        updated(formatString: "LL", locale: "ja")
      }
    }
  }
`
