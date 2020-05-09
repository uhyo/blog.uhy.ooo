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
    markdownRemark: {
      html: string
    } | null
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

const TagPageTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const tagDescHtml = data.markdownRemark?.html
  const posts = data.allMarkdownRemark.edges
  const { tag } = pageContext

  return (
    <Layout>
      <SEO title={`タグ: ${tag}`} />
      <h1>
        <FontAwesomeIcon icon="tags" aria-label="タグ" />
        {tag}
      </h1>
      {tagDescHtml && (
        <>
          <main
            dangerouslySetInnerHTML={{
              __html: tagDescHtml,
            }}
          />
          <hr />
        </>
      )}
      {posts.map(({ node }) => {
        return <ArticleListItem key={node.fields.slug} {...node} />
      })}
    </Layout>
  )
}

export default TagPageTemplate

export const pageQuery = graphql`
  query($tag: String, $slug: String) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___published], order: DESC }
      filter: {
        frontmatter: { tags: { in: [$tag] } }
        fields: { sourceFileType: { eq: "blog" } }
      }
    ) {
      edges {
        node {
          ...ArticleInList
        }
      }
    }
  }
`
