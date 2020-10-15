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
  tableOfContents: {
    items?: TableOfContentsItem[]
  }
  frontmatter: Pick<Frontmatter, FrontmatterKeys>
  fields: {
    slug: string
    filePath: string
  }
}

export type TableOfContentsItem = {
  url: string
  title: string
  items?: TableOfContentsItem[]
}
