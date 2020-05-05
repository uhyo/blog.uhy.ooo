import { Link } from "gatsby"
import React from "react"
import styled from "styled-components"
import { mainColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"

type Props = {
  className?: string
  title: string
}

const HeaderInner: React.FC<Props> = ({ title, className }) => {
  return (
    <header className={className}>
      <h1>
        <Link
          style={{
            color: `inherit`,
            textDecoration: "none",
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    </header>
  )
}

export const Header = styled(HeaderInner)`
  background-color: ${mainColor.normal};
  padding: ${rhythm(0.5)} ${rhythm(3 / 4)};

  & > h1 {
    font-family: "Source Code Pro";
    color: #ffffff;
    margin: 0;
    ${scale(1)}
  }
`
