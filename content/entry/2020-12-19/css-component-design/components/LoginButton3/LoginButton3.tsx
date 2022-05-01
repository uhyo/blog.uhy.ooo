import React from "react"
import "./LoginButtons3.module.css"
import { button } from "./LoginButton3.module.css"

type Props = {
  className?: string
}

export const LoginButton3: React.VFC<Props> = ({ className }) => (
  <button className={button + (className ? ` ${className}` : "")}>
    ログイン
  </button>
)
