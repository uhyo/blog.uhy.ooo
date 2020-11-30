import styled from "styled-components"
import FukidashiImg from "./fukidashi.png"

export const Fukidashi = styled.em`
  display: inline-block;
  position: relative;
  height: 48px;
  border: 12px solid transparent;
  font-style: normal;
  font-weight: bold;

  &::after {
    content: "";
    display: block;
    box-sizing: content-box;
    width: 200%;
    height: 48px;
    position: absolute;
    top: -24px;
    left: -24px;
    border: 24px solid transparent;
    border-image: url(${FukidashiImg}) calc(100% / 3) / 24px space;
    transform: scale(0.5) translateY(4px);
    transform-origin: 24px 24px;
  }
`
