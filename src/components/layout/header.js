import { Link } from "gatsby"
import React from "react"
import styled from "styled-components"
import { mainColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"

const HeaderInner = ({ title, className }) => {
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
  background-color: ${mainColor.light};
  color: ${mainColor.dark};
  padding: ${rhythm(1)} ${rhythm(3 / 4)};

  & > h1 {
    font-family: "Source Code Pro";
    margin: 0;
    ${scale(1)};
  }
`
