import { graphql } from "gatsby"
import React from "react"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import { MarkdownRemark } from "../../types/article"
import { Article } from "./Article"
import { Nav } from "./Nav"
import { TOC } from "./TOC"
import Bio from "../../components/bio"

type Props = {
  data: {
    markdownRemark: MarkdownRemark<"title" | "published" | "updated" | "tags">
  }
  pageContext: {
    slug: string
    previous?: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
    next?: Pick<MarkdownRemark<"title">, "fields" | "frontmatter">
  }
}

const BlogPostTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const { slug, previous, next } = pageContext

  return (
    <Layout
      title={post.frontmatter.title}
      slug={slug}
      rightSide={
        <>
          <Bio />
          <TOC tableOfContents={post.tableOfContents} />
        </>
      }
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
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      tableOfContents
      frontmatter {
        title
        published
        updated
        tags
      }
    }
  }
`
