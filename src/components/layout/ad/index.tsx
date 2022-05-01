import styled from "styled-components"
import React from "react"
import { rhythm, scale } from "../../../utils/typography"
import { grayColor } from "../../../utils/color"
import { StaticImage } from "gatsby-plugin-image"

const AdInner: React.FunctionComponent<{
  className?: string
}> = ({ className }) => {
  return (
    <aside className={className}>
      <div>『プロを目指す人のためのTypeScript入門』発売中！</div>
      <a
        href="https://gihyo.jp/book/2022/978-4-297-12747-3"
        rel="external noopener"
      >
        <StaticImage src="./book.jpeg" alt="書影" layout="constrained" />
      </a>
    </aside>
  )
}

export const Ad = styled(AdInner)`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: ${rhythm(7)};

  color: ${grayColor.darkest};
  ${scale(-0.25)};
`
