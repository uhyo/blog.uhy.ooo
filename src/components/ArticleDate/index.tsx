import React from "react"
import { Frontmatter } from "../../types/article"

type Props = Pick<Frontmatter, "updated" | "published">

const format = (d: Date) => {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export const ArticleDate: React.FC<Props> = ({ updated, published }) => {
  // const fmtOption = {
  //   // dateStyle: "full",
  // } as any
  // const fmt = new Intl.DateTimeFormat("ja-JP", fmtOption)
  // const pubd = fmt.format(new Date(published))
  // const upd = updated ? fmt.format(new Date(updated)) : undefined
  const pubd = format(new Date(published))
  const upd = updated ? format(new Date(updated)) : undefined
  return (
    <>
      {pubd} 公開{upd ? ` / ${upd} 更新` : null}
    </>
  )
}
