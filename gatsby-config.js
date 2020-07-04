const siteTitle = "uhyo/blog"

module.exports = {
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
    "gatsby-plugin-netlify-cache",
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
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-prismjs-title",
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
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
            },
          },
          `gatsby-remark-copy-linked-files`,
          // `gatsby-remark-smartypants`,
          {
            resolve: "gatsby-remark-external-links",
            options: {
              rel: "external noopener",
            },
          },
          "gatsby-remark-numbered-footnotes",
        ],
      },
    },
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
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
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
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___published] },
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
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    "gatsby-plugin-styled-components",
    "gatsby-plugin-typescript",
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
