import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { graphql, HeadFC, PageProps } from "gatsby"
import React from "react"
import {
  ArticleListItem,
  ArticleListItemData,
} from "../../components/ArticleListItem"
import Layout from "../../components/layout"
import SEO from "../../components/seo"
import Bio from "../../components/bio"

type DataType = {
  allMdx: {
    edges: Array<{
      node: ArticleListItemData
    }>
  }
}
type PageContext = {
  tag: string
  slug: string
}

/**
 * `children` is the tag description from content/tag/*.mdx (if exists)
 */
const TagPageTemplate: React.FC<PageProps<DataType, PageContext>> = ({
  data,
  pageContext,
  children,
}) => {
  const posts = data.allMdx.edges
  const { tag, slug } = pageContext

  const title = `タグ: ${tag}`
  return (
    <Layout title={title} slug={slug} rightSide={<Bio />}>
      <h1>
        <FontAwesomeIcon icon="tags" aria-label="タグ" />
        {tag}
      </h1>
      {children && (
        <>
          <main>{children}</main>
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

export const Head: HeadFC<DataType, PageContext> = ({ pageContext }) => (
  <SEO title={`タグ: ${pageContext.tag}`} />
)

export const pageQuery = graphql`
  query ($tag: String) {
    allMdx(
      sort: { frontmatter: { published: DESC } }
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
