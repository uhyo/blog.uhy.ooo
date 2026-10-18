import { HeadFC } from "gatsby"
import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <h1>Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  )
}

export default NotFoundPage

export const Head: HeadFC = () => <SEO title="404" />
