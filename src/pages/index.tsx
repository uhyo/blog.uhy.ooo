import { graphql } from "gatsby"
import React from "react"
import {
  ArticleListItem,
  ArticleListItemData,
} from "../components/ArticleListItem"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

type Props = {
  data: {
    allMarkdownRemark: {
      edges: Array<{
        node: ArticleListItemData
      }>
    }
  }
}

const BlogIndex: React.FC<Props> = ({ data }) => {
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout rightSide={<Bio />}>
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
    allMarkdownRemark(
      sort: { fields: [frontmatter___published], order: DESC }
    ) {
      edges {
        node {
          ...ArticleInList
        }
      }
    }
  }
`
