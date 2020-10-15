import React from "react"
import styled from "styled-components"
import { TableOfContentsItem } from "../../types/article"
import { mainColor } from "../../utils/color"
import { rhythm, scale } from "../../utils/typography"

const TOCItem: React.FunctionComponent<{
  item: TableOfContentsItem
}> = ({ item }) => {
  if (item.items) {
    return (
      <li>
        <p>
          <a href={item.url}>{item.title}</a>
        </p>
        <ul>
          {item.items.map(i => (
            <TOCItem key={i.url} item={i} />
          ))}
        </ul>
      </li>
    )
  } else {
    return (
      <li>
        <a href={item.url}>{item.title}</a>
      </li>
    )
  }
}

type Props = {
  tableOfContents?: TableOfContentsItem[]
  className?: string
}

const TOCInner: React.FunctionComponent<Props> = ({
  tableOfContents,
  className,
}) => {
  return (
    <nav className={className}>
      <ul>
        {tableOfContents?.map(item => (
          <TOCItem key={item.url} item={item} />
        ))}
      </ul>
    </nav>
  )
}

export const TOC = styled(TOCInner)`
  position: sticky;
  top: 0;
  padding: ${rhythm(1)} 0 0 ${rhythm(0.25)};

  ${scale(-0.25)};
  line-height: 1.25em;

  ul,
  li {
    margin: 0;
    list-style-type: none;
  }

  a,
  a:visited {
    display: block;
    color: var(--fg-link-color);
    text-decoration: none;
  }

  li > ul {
    border-left: 1px solid ${mainColor.light};
    margin-left: ${rhythm(0.25)};
    padding-left: ${rhythm(0.25)};
  }

  li > p {
    margin: 0 0 ${rhythm(0.5)} 0;
  }

  li > a {
    margin: 0 0 ${rhythm(3 / 8)} 0;
  }

  li > p:hover,
  li > a:hover {
    background-color: hsla(0, 0%, 0%, 0.05);

    @media (prefers-color-scheme: dark) {
      background-color: hsla(0, 100%, 100%, 0.05);
    }
  }
`
