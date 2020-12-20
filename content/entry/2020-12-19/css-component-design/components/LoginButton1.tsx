import React from "react"
import styles from "./LoginButton1.module.css"

type Props = {
  className?: string
}

export const LoginButton1: React.VFC<Props> = ({ className }) => (
  <button className={styles.button + (className ? ` ${className}` : "")}>
    ログイン
  </button>
)
