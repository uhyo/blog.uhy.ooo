/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * Use this in the `Head` export of pages.
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { SiteMetadata } from "../types/siteMetadata"

type Props = {
  description?: string
  lang?: string
  title: string
  children?: React.ReactNode
}

const SEO: React.FC<Props> = ({
  description,
  lang = "ja",
  title,
  children,
}) => {
  const { site } = useStaticQuery<{
    site: {
      siteMetadata: Pick<
        SiteMetadata,
        "title" | "description" | "social" | "siteUrl"
      >
    }
  }>(graphql`
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
  `)

  const metaDescription = description || site.siteMetadata.description

  const titleDisp = title
    ? `${title} - ${site.siteMetadata.title}`
    : site.siteMetadata.title

  return (
    <>
      <html lang={lang} />
      <title>{titleDisp}</title>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Source+Code+Pro:wght@700&display=swap"
      />
      <meta
        name="google-site-verification"
        content="vkLNrhODKBHfKRqUsDXHvuMLqlFgq7roYXq_fUqTYXo"
      />
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={titleDisp} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        // TODO: remove this image file
        content={`${site.siteMetadata.siteUrl}/images/blog-logo-256.png`}
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={site.siteMetadata.social.twitter} />
      <meta name="twitter:title" content={titleDisp} />
      <meta name="twitter:description" content={metaDescription} />
      {children}
    </>
  )
}

export default SEO
