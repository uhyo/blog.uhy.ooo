import React from "react"
import { LoginButton3 } from "./LoginButton3"
import * as styles from "./LoginButtons3.module.css"

export const RedLoginButton3 = () => (
  <LoginButton3 className={styles.redButton} />
)

export const MovingLoginButton3 = () => (
  <LoginButton3 className={styles.movingButton} />
)

export const MovingLoginButton3Fixed = () => (
  <span className={styles.movingButtonSpan}>
    <LoginButton3 />
  </span>
)
