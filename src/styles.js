import styled, {css} from "styled-components";
import {Link} from "react-router-dom";

export const shadow = css`
  box-shadow: 3px 3px 25px #0000001C;
`

export const buttonCss = css`
  color: white;
  border-radius: 0.3em;
  border: none;
  padding: 0.5em 1.5em;
  margin: 1em;
  min-width: 100px;

  transition: all 0.2s;

  :hover {
    cursor: pointer;
  }

  :focus {
    outline: none;
  }
`

export const InlineLink = styled(Link)`
  text-decoration: underline;
`

export const ButtonLink = styled(Link)`
  ${buttonCss};
  background: #0f2027;

  :hover {
    background: #0f2027cF;
  }
`


export const ConfirmButton = styled.button`
  ${buttonCss};
  background: #3cc921;

  :hover {
    background: #3cc921cF;
  }
`

export const RejectButton = styled.button`
  ${buttonCss};
  background: #FF4040;

  :hover {
    background: #FF4040cF;
    cursor: pointer;
  }
`