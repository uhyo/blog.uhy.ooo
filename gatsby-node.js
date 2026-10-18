const fs = require(`fs`)
const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

const createEntryPages = async (graphql, actions) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post/index.tsx`)
  const result = await graphql(`
    {
      allMdx(
        sort: { frontmatter: { published: DESC } }
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
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMdx.edges

  const toNavItem = ({ fields, frontmatter }) => ({ fields, frontmatter })

  posts.forEach((post, index) => {
    const previous =
      index === posts.length - 1 ? null : toNavItem(posts[index + 1].node)
    const next = index === 0 ? null : toNavItem(posts[index - 1].node)

    createPage({
      path: post.node.fields.slug,
      component: `${blogPost}?__contentFilePath=${post.node.internal.contentFilePath}`,
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
      allMdx {
        group(field: { frontmatter: { tags: SELECT } }) {
          tag: fieldValue
          totalCount
        }
      }
      tagDescriptions: allMdx(
        filter: { fields: { sourceFileType: { eq: "tag" } } }
      ) {
        nodes {
          fields {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const tags = result.data.allMdx.group
  const tagDescriptionFiles = new Map(
    result.data.tagDescriptions.nodes.map(node => [
      node.fields.slug,
      node.internal.contentFilePath,
    ]),
  )

  for (const { tag } of tags) {
    const slug = `/tag/${tag}/`
    const descriptionFile = tagDescriptionFiles.get(slug)
    createPage({
      path: slug,
      // tag description (content/tag/*.mdx) is rendered as children of the template
      component: descriptionFile
        ? `${tagTemplate}?__contentFilePath=${descriptionFile}`
        : tagTemplate,
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

  if (node.internal.type === `Mdx`) {
    // parent node is from gatsby-source-filesystem
    const parent = getNode(node.parent)
    const { sourceInstanceName } = parent
    createNodeField({
      name: "sourceFileType",
      node,
      value: sourceInstanceName,
    })

    const prefix = sourceInstanceName === "blog" ? "/entry" : "/tag"

    const fp = createFilePath({ node, getNode })
    const value = prefix + fp
    createNodeField({
      name: `slug`,
      node,
      value,
    })

    createNodeField({
      name: `filePath`,
      node,
      value: value + "index.mdx",
    })
  }
}

/**
 * gatsby-plugin-mdx v5 no longer provides the `html` field, which is used for
 * the full content of RSS feed items. This renders an HTML version of the
 * article. Imports and custom components are dropped (custom components are
 * replaced with their children) since they cannot be rendered here.
 */
exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Mdx: {
      html: {
        type: `String`,
        resolve: async (node, _args, context) => {
          const site = await context.nodeModel.findOne({ type: `Site` })
          const siteUrl = site.siteMetadata.siteUrl.replace(/\/$/, "")
          const fileNode = context.nodeModel.getNodeById({ id: node.parent })
          return renderMdxToHtml(
            node.body,
            fileNode ? path.dirname(fileNode.absolutePath) : null,
            siteUrl,
            context.nodeModel,
          )
        },
      },
    },
  })
}

async function renderMdxToHtml(body, baseDir, siteUrl, nodeModel) {
  const [
    { evaluate },
    { default: remarkGfm },
    runtime,
    { renderToStaticMarkup },
  ] = await Promise.all([
    import(`@mdx-js/mdx`),
    import(`remark-gfm`),
    import(`react/jsx-runtime`),
    import(`react-dom/server`),
  ])

  // Relative links to local files (mostly images) are converted to absolute URLs
  const resolveLocalUrl = async url => {
    if (!baseDir || !url || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url)) {
      return url
    }
    const absolutePath = path.join(
      baseDir,
      decodeURI(url.replace(/[?#].*$/, "")),
    )
    const file = await nodeModel.findOne({
      type: `File`,
      query: { filter: { absolutePath: { eq: absolutePath } } },
    })
    return file ? siteUrl + copyToPublic(file) : url
  }

  const remarkFeedContent = () => async tree => {
    const urlNodes = []
    const walk = parent => {
      if (!parent.children) return
      parent.children = parent.children.flatMap(child => {
        switch (child.type) {
          case `mdxjsEsm`:
          case `mdxFlowExpression`:
          case `mdxTextExpression`:
            return []
          case `mdxJsxFlowElement`:
          case `mdxJsxTextElement`:
            if (!child.name || /^[A-Z]/.test(child.name)) {
              walk(child)
              return child.children
            }
            // drop attributes with JavaScript expressions
            child.attributes = child.attributes.filter(
              attr =>
                attr.type === `mdxJsxAttribute` &&
                (attr.value === null || typeof attr.value === `string`),
            )
            break
          case `image`:
          case `link`:
          case `definition`:
            urlNodes.push(child)
            break
        }
        walk(child)
        return [child]
      })
    }
    walk(tree)
    await Promise.all(
      urlNodes.map(async node => {
        node.url = await resolveLocalUrl(node.url)
      }),
    )
  }

  const { default: Content } = await evaluate(body, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkFeedContent],
  })
  return renderToStaticMarkup(runtime.jsx(Content, {}))
}

/**
 * Same as the `publicURL` field of File nodes
 */
function copyToPublic(file) {
  const fileName = `${file.internal.contentDigest}/${file.base}`
  const publicPath = path.join(process.cwd(), `public`, `static`, fileName)
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(path.dirname(publicPath), { recursive: true })
    fs.copyFileSync(file.absolutePath, publicPath)
  }
  return `/static/${fileName}`
}
