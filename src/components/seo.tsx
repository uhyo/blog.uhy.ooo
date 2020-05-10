/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"
import { SiteMetadata } from "../types/siteMetadata"

type Props = {
  description?: string
  lang?: string
  meta?: any[]
  title: string
}

const SEO: React.FC<Props> = ({
  description,
  lang = "ja",
  meta = [],
  title,
}) => {
  const { site } = useStaticQuery<{
    site: {
      siteMetadata: Pick<
        SiteMetadata,
        "title" | "description" | "social" | "siteUrl"
      >
    }
  }>(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
            social {
              twitter
            }
          }
        }
      }
    `
  )

  const metaDescription = description || site.siteMetadata.description

  const titleDisp = title
    ? `${title} - ${site.siteMetadata.title}`
    : site.siteMetadata.title

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={titleDisp}
      link={[
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Source+Code+Pro:wght@700&display=swap",
        },
      ]}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: titleDisp,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          property: `og:image`,
          // TODO: remove this image file
          content: `${site.siteMetadata.siteUrl}/images/blog-logo-256.png`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.social.twitter,
        },
        {
          name: `twitter:title`,
          content: titleDisp,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat(meta)}
    />
  )
}

export default SEO
