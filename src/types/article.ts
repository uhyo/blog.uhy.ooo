/**
 * Frontmatter of article
 */
export type Frontmatter = {
  title: string
  /**
   * Publish date
   */
  published: string
  /**
   * Updated date
   */
  updated?: string
}

/**
 * markdownRemark data
 */
export type MarkdownRemark<FrontmatterKeys extends keyof Frontmatter> = {
  id: string
  excerpt: string
  html: string
  tableOfContents: string
  frontmatter: Pick<Frontmatter, FrontmatterKeys>
  fields: {
    slug: string
  }
}
