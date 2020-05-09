import { graphql } from "gatsby"
import React from "react"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import {
  ArticleListItemData,
  ArticleListItem,
} from "../../components/ArticleListItem"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type Props = {
  data: {
    allMarkdownRemark: {
      edges: Array<{
        node: ArticleListItemData
      }>
    }
  }
  pageContext: {
    tag: string
  }
}

const BlogPostTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const posts = data.allMarkdownRemark.edges
  const { tag } = pageContext

  return (
    <Layout>
      <SEO title={tag} />
      <h1>
        <FontAwesomeIcon icon="tags" aria-label="タグ" />
        {tag}
      </h1>
      {posts.map(({ node }) => {
        return <ArticleListItem key={node.fields.slug} {...node} />
      })}
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___published], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      edges {
        node {
          ...ArticleInList
        }
      }
    }
  }
`
