import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { graphql, useStaticQuery } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import React from "react"
import styled from "styled-components"
import { ArticleDate } from "../../components/ArticleDate"
import { Tags } from "../../components/Tags"
import { Mdx } from "../../types/article"
import { SiteMetadata } from "../../types/siteMetadata"
import { grayColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"

type Props = {
  className?: string
  slug: string
  post: Pick<
    Mdx<"title" | "published" | "updated" | "tags">,
    "frontmatter" | "body"
  >
}

const ArticleInner: React.FC<Props> = ({ className, post, slug }) => {
  const { site } = useStaticQuery<{
    site: {
      siteMetadata: Pick<SiteMetadata, "repo">
    }
  }>(
    graphql`
      query {
        site {
          siteMetadata {
            repo
          }
        }
      }
    `
  )

  return (
    <article className={className}>
      <header>
        <h1>{post.frontmatter.title}</h1>
        <p>
          <ArticleDate {...post.frontmatter} />
        </p>
        {post.frontmatter.tags ? (
          <div>
            <Tags tags={post.frontmatter.tags} />
          </div>
        ) : null}
      </header>
      <main>
        <MDXRenderer>{post.body}</MDXRenderer>
      </main>
      <footer>
        <FontAwesomeIcon icon={["fab", "github"]} />
        <a
          target="_blank"
          href={`${site.siteMetadata.repo}/tree/master/content${slug}`}
          rel="external noopener"
        >
          GitHubで見る（編集を提案）
        </a>
      </footer>
      <hr />
    </article>
  )
}

export const Article = styled(ArticleInner)`
  & > header > h1 {
    margin: 0 0 ${rhythm(0.25)};
  }

  & > header > p {
    display: block;
    margin-bottom: 0;
    ${scale(-0.25)};
    color: var(--fg-demisub-color);
  }

  & > header > div {
    margin: ${rhythm(0.25)} 0;
  }

  & > main {
    margin-top: ${rhythm(0.5)};
  }

  & > footer {
    margin-bottom: ${rhythm(0.5)};

    a {
      display: inline-block;
      margin-left: ${rhythm(0.25)};
    }
  }

  & > hr {
    margin-bottom: ${rhythm(1)};
  }

  h2 {
    margin-top: ${rhythm(3)};
    padding-bottom: ${rhythm(1 / 16)};
    border-bottom: 1px solid ${grayColor.light};
  }
`
