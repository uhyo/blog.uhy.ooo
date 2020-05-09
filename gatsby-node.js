const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const createEntryPages = async (graphql, actions) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post/index.tsx`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___published], order: DESC }
          limit: 1000
          filter: { fields: { sourceFileType: { eq: "blog" } } }
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

const createTagPages = async (graphql, actions) => {
  const { createPage } = actions
  const tagTemplate = path.resolve("./src/templates/tag/index.tsx")

  const result = await graphql(`
    {
      allMarkdownRemark {
        group(field: frontmatter___tags) {
          tag: fieldValue
          totalCount
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const tags = result.data.allMarkdownRemark.group

  for (const { tag } of tags) {
    const slug = `/tag/${tag}/`
    createPage({
      path: slug,
      component: tagTemplate,
      context: {
        tag,
        slug,
      },
    })
  }
}

exports.createPages = async ({ graphql, actions }) => {
  await createEntryPages(graphql, actions)
  await createTagPages(graphql, actions)
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    // parent node is from gatsby-source-filesystem
    const parent = getNode(node.parent)
    const { sourceInstanceName } = parent
    createNodeField({
      name: "sourceFileType",
      node,
      value: sourceInstanceName,
    })

    const prefix = sourceInstanceName === "blog" ? "/entry" : "/tag"

    const value = prefix + createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
