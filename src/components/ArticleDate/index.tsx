import React from "react"
import { Frontmatter } from "../../types/article"

type Props = Pick<Frontmatter, "updated" | "published">

export const ArticleDate: React.FC<Props> = ({ updated, published }) => {
  return (
    <>
      {published} 公開{updated ? ` / ${updated} 更新` : null}
    </>
  )
}
