import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import React from "react"
import {
  ArticleListItem,
  ArticleListItemData,
} from "../../components/ArticleListItem"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import Bio from "../../components/bio"

type Props = {
  data: {
    mdx: {
      body: string
    } | null
    allMdx: {
      edges: Array<{
        node: ArticleListItemData
      }>
    }
  }
  pageContext: {
    tag: string
    slug: string
  }
}

const TagPageTemplate: React.FC<Props> = ({ data, pageContext }) => {
  const tagDescBody = data.mdx?.body
  const posts = data.allMdx.edges
  const { tag, slug } = pageContext

  const title = `タグ: ${tag}`
  return (
    <Layout title={title} slug={slug} rightSide={<Bio />}>
      <SEO title={title} />
      <h1>
        <FontAwesomeIcon icon="tags" aria-label="タグ" />
        {tag}
      </h1>
      {tagDescBody && (
        <>
          <main>
            <MDXRenderer>{tagDescBody}</MDXRenderer>
          </main>
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
    mdx(fields: { slug: { eq: $slug } }) {
      body
    }
    allMdx(
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
