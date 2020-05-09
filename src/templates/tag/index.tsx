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
    <Layout title={tag}>
      <SEO title={tag} />
      <p>たぐ！！！ {tag}</p>
    </Layout>
  )
}

export default BlogPostTemplate

/*
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
        tags
      }
    }
  }
`
*/
