import { graphql, HeadFC, PageProps } from "gatsby"
import React from "react"
import {
  ArticleListItem,
  ArticleListItemData,
} from "../components/ArticleListItem"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

type DataType = {
  allMdx: {
    edges: Array<{
      node: ArticleListItemData
    }>
  }
}

const BlogIndex: React.FC<PageProps<DataType>> = ({ data }) => {
  const posts = data.allMdx.edges

  return (
    <Layout title="" slug="/" rightSide={<Bio />}>
      {posts.map(({ node }) => {
        return <ArticleListItem key={node.fields.slug} {...node} />
      })}
    </Layout>
  )
}

export default BlogIndex

export const Head: HeadFC = () => <SEO title="" />

export const pageQuery = graphql`
  query {
    allMdx(
      sort: { frontmatter: { published: DESC } }
      filter: { fields: { sourceFileType: { eq: "blog" } } }
    ) {
      edges {
        node {
          ...ArticleInList
        }
      }
    }
  }
`
