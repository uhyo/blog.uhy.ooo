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
  /**
   * Tags
   */
  tags?: string[]
}

/**
 * mdx data
 */
export type Mdx<FrontmatterKeys extends keyof Frontmatter> = {
  id: string
  excerpt: string
  body: string
  tableOfContents: string
  frontmatter: Pick<Frontmatter, FrontmatterKeys>
  fields: {
    slug: string
    filePath: string
  }
}
