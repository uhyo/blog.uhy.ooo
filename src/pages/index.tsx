import { graphql } from "gatsby"
import React from "react"
import { ArticleListItem } from "../components/ArticleListItem"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { MarkdownRemark } from "../types/article"
import { SiteMetadata } from "../types/siteMetadata"

type Props = {
  data: {
    site: {
      siteMetadata: Pick<SiteMetadata, "title">
    }
    allMarkdownRemark: {
      edges: Array<{
        node: Pick<
          MarkdownRemark<"published" | "updated" | "title">,
          "fields" | "frontmatter" | "excerpt"
        >
      }>
    }
  }
}

const BlogIndex: React.FC<Props> = ({ data }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout title={siteTitle} rightSide={<Bio />}>
      <SEO title="" />
      {posts.map(({ node }) => {
        return <ArticleListItem key={node.fields.slug} {...node} />
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___published], order: DESC }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            published(formatString: "LL", locale: "ja")
            updated(formatString: "LL", locale: "ja")
            title
          }
        }
      }
    }
  }
`
