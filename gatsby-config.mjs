import { dirname } from "path"
import remarkGfm from "remark-gfm"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const siteTitle = "uhyo/blog"

/**
 * Adds the class that gatsby-remark-prismjs used to give to inline code.
 * Inline code is not processed by gatsby-remark-prismjs (`noInlineHighlight`)
 * because its raw HTML output is invisible to excerpts in gatsby-plugin-mdx v5.
 */
const remarkInlineCodeClass = () => tree => {
  const walk = node => {
    if (node.type === "inlineCode") {
      node.data = {
        ...node.data,
        hProperties: { className: ["language-text"] },
      }
    }
    node.children?.forEach(walk)
  }
  walk(tree)
}

const config = {
  siteMetadata: {
    title: siteTitle,
    author: {
      name: "uhyo",
      summary: "metcha yowai software engineer",
      url: "https://uhy.ooo/",
    },
    description: "うひょの技術ブログです。",
    siteUrl: `https://blog.uhy.ooo/`,
    social: {
      twitter: `uhyo_`,
      github: "uhyo",
      qiita: "uhyo",
    },
    repo: "https://github.com/uhyo/blog.uhy.ooo",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/entry`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/tag`,
        name: `tag`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      // remark for blog posts
      resolve: `gatsby-plugin-mdx`,
      options: {
        mdxOptions: {
          // GFM (tables, footnotes, etc.) was built into MDX v1
          remarkPlugins: [remarkGfm, remarkInlineCodeClass],
        },
        gatsbyRemarkPlugins: [
          {
            resolve: "gatsby-remark-prismjs-title",
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
              withWebp: true,
              withAvif: true,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          "gatsby-remark-autolink-headers",
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              showLineNumbers: true,
              noInlineHighlight: true,
            },
          },
          `gatsby-remark-copy-linked-files`,
          {
            resolve: "gatsby-remark-external-links",
            options: {
              rel: "external noopener",
            },
          },
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-46093038-6",
      },
    },
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.published,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                })
              })
            },
            query: `
              {
                allMdx(
                  sort: { frontmatter: { published: DESC } }
                  filter: { fields: { sourceFileType: { eq: "blog" } } }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        published
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "blog.uhy.ooo RSS Feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: siteTitle,
        short_name: siteTitle,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#2c91ec`,
        display: `minimal-ui`,
        icon: `content/assets/blog-logo.png`,
      },
    },
    "gatsby-plugin-styled-components",
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}

export default config
