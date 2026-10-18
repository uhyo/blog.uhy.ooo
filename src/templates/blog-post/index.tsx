import { graphql, HeadFC, PageProps } from "gatsby"
import React from "react"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import { Mdx } from "../../types/article"
import { Article } from "./Article"
import { Nav } from "./Nav"
import { TOC } from "./TOC"
import Bio from "../../components/bio"

type DataType = {
  mdx: Omit<Mdx<"title" | "published" | "updated" | "tags">, "body">
}
type PageContext = {
  slug: string
  previous: Pick<Mdx<"title">, "fields" | "frontmatter"> | null
  next: Pick<Mdx<"title">, "fields" | "frontmatter"> | null
}

const BlogPostTemplate: React.FC<PageProps<DataType, PageContext>> = ({
  data,
  pageContext,
  children,
}) => {
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
      <Article post={post} slug={post.fields.filePath}>
        {children}
      </Article>
      <Nav previous={previous ?? undefined} next={next ?? undefined} />
    </Layout>
  )
}

export default BlogPostTemplate

export const Head: HeadFC<DataType, PageContext> = ({ data }) => (
  <SEO title={data.mdx.frontmatter.title} description={data.mdx.excerpt} />
)

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
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
