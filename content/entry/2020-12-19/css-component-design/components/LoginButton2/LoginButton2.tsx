import React from "react"
import styles from "./LoginButton2.module.css"

type Props = {
  className?: string
}

export const LoginButton2: React.VFC<Props> = ({ className }) => (
  <button className={styles.button + (className ? ` ${className}` : "")}>
    ログイン
  </button>
)
