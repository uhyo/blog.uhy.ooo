import React from "react"
import { Frontmatter } from "../../types/article"

type Props = Pick<Frontmatter, "updated" | "published">

export const ArticleDate: React.FC<Props> = ({ updated, published }) => {
  const fmtOption = {
    dateStyle: "full",
  }
  const fmt = new Intl.DateTimeFormat("ja-JP", fmtOption)
  const pubd = fmt.format(new Date(published))
  const upd = updated ? fmt.format(new Date(updated)) : undefined
  return (
    <>
      {pubd} 公開{upd ? ` / ${upd} 更新` : null}
    </>
  )
}
