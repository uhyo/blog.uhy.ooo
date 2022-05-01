import React from "react"
import { button } from "./LoginButton1.module.css"

type Props = {
  className?: string
}

export const LoginButton1: React.VFC<Props> = ({ className }) => (
  <button className={button + (className ? ` ${className}` : "")}>
    ログイン
  </button>
)
