import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "gatsby"
import React from "react"
import styled from "styled-components"
import { grayColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"

type Props = {
  className?: string
  tags: string[]
}

const TagsInner: React.FunctionComponent<Props> = ({ className, tags }) => {
  return (
    <div className={className}>
      <FontAwesomeIcon aria-label="タグ" icon="tags" />
      <ul>
        {tags.map(tag => (
          <li key={tag}>
            <Link to={`/tag/${tag}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const Tags = styled(TagsInner)<{
  scale?: number
}>`
  display: flex;
  flex-flow: row nowrap;
  ${props => scale(props.scale ?? -1 / 8)}

  & > *:first-child {
    align-self: center;
  }

  & > ul {
    display: flex;
    flex-flow: row wrap;
    margin: 0;
    list-style: none;
  }

  & > ul > li {
    margin: 0 0 0 ${rhythm(0.25)};
  }

  & > ul > li > a {
    padding: ${rhythm(1 / 8)};
    border-radius: 10%;
    background-color: ${grayColor.lighter};
    color: ${grayColor.darkest};
    text-decoration: none;
  }
`
