import styled from "styled-components"
import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { rhythm, scale } from "../../utils/typography"
import HBLogo from "./hatenabookmark-logomark.svg"

type Props = {
  className?: string
  text: string
  url: string
}

const ShareButtonsInner: React.FunctionComponent<Props> = ({
  className,
  text,
  url,
}) => {
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`
  const hatenaHref = `https://b.hatena.ne.jp/entry?url=${encodeURIComponent(
    url
  )}`
  return (
    <div className={className}>
      <div>Share:</div>
      <nav>
        <a
          aria-label="Share on Twitter"
          href={twitterHref}
          rel="external noopener"
          target="_blank"
        >
          <FontAwesomeIcon icon={["fab", "twitter"]} />
        </a>
        <a href={hatenaHref} rel="external noopener" target="_blank">
          <img src={HBLogo} alt="はてなブックマーク" />
        </a>
      </nav>
    </div>
  )
}

export const ShareButtons = styled(ShareButtonsInner)`
  a {
    display: block;
    appearance: none;
    border: none;
    margin: 0 ${rhythm(3 / 4)} 0 0;
    background: none;
    ${scale(1)}
    line-height: 0;
  }

  img {
    width: 1em;
    height: 1em;
    margin: 0;
  }

  & > nav {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }

  & > nav > a:first-child {
    color: #1da1f2;
  }
`
