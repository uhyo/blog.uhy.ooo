import { graphql } from "gatsby"
import React from "react"
import Layout from "../../components/layout"
import SEO from "../../components/seo"

type Props = {
  data: {}
  pageContext: {
    tag: string
  }
}

const BlogPostTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const { tag } = pageContext

  return (
    <Layout>
      <SEO title={tag} />
      <p>たぐ！！！ {tag}</p>
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
