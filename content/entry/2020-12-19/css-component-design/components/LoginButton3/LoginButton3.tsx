import React from "react"
import "./LoginButtons3.module.css"
import styles from "./LoginButton3.module.css"

type Props = {
  className?: string
}

export const LoginButton3: React.VFC<Props> = ({ className }) => (
  <button className={styles.button + (className ? ` ${className}` : "")}>
    ログイン
  </button>
)
