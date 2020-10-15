import { graphql } from "gatsby"
import React from "react"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import { Mdx } from "../../types/article"
import { Article } from "./Article"
import { Nav } from "./Nav"
import { TOC } from "./TOC"
import Bio from "../../components/bio"

type Props = {
  data: {
    mdx: Mdx<"title" | "published" | "updated" | "tags">
  }
  pageContext: {
    slug: string
    previous?: Pick<Mdx<"title">, "fields" | "frontmatter">
    next?: Pick<Mdx<"title">, "fields" | "frontmatter">
  }
}

const BlogPostTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const post = data.mdx
  const { slug, previous, next } = pageContext

  return (
    <Layout
      title={post.frontmatter.title}
      slug={slug}
      rightSide={
        <>
          <Bio />
          <TOC tableOfContents={post.tableOfContents.items} />
        </>
      }
    >
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      <Article post={post} slug={post.fields.filePath} />
      <Nav previous={previous} next={next} />
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      body
      tableOfContents
      frontmatter {
        title
        published
        updated
        tags
      }
      fields {
        filePath
      }
    }
  }
`
