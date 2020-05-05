/**
 * Frontmatter of article
 */
export type Frontmatter = {
  title: string
  date: string
}

/**
 * markdownRemark data
 */
export type MarkdownRemark<FrontmatterKeys extends keyof Frontmatter> = {
  id: string
  excerpt: string
  html: string
  frontmatter: Pick<Frontmatter, FrontmatterKeys>
}
