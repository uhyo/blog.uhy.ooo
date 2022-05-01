import styled from "styled-components"
import React from "react"
import { rhythm, scale } from "../../../utils/typography"
import { grayColor } from "../../../utils/color"

const AdInner: React.FunctionComponent<{
  className?: string
}> = ({ className }) => {
  return (
    <aside className={className}>
      <div>『プロを目指す人のためのTypeScript入門』発売中！</div>
    </aside>
  )
}

export const Ad = styled(AdInner)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: ${rhythm(7)};
  height: ${rhythm(5)};

  background-color: ${grayColor.lighter};
  color: ${grayColor.darkest};
  ${scale(-0.25)};
`
