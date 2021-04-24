import styled, {css} from "styled-components";
import {Link} from "react-router-dom";
import {createGlobalStyle} from 'styled-components';

export const theme = {
  interfaceColor: '#FEFEFE',
  textColor: '#FEFEFE',
  lowerContrastTextColor: '#a5b4c3',
  invertedTextColor: '#222f3e',
  invertedLowerContrastTextColor: '#242f3e',
  successColor: '#00C781',
  dangerColor: '#FF4040',
  backgroundColor: '#222f3e',
}

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "Avenir";
    src: url("./resources/Avenir-Roman.otf")
  }

  select, input, textarea, button {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  html, body {
    font-family: "Avenir", sans-serif;
    background-color: ${props => props.theme.backgroundColor};
    color: ${props => props.theme.textColor};
    margin: 0;
    height: 100%;
  }

  i:hover {
    cursor: help;
  }

  a {
    color: ${props => props.theme.textColor};
    text-decoration: none;
  }

  h1 {
    font-weight: bold;
    font-size: 4em;
  }

  pre {
    font-family: Monaco, SFMono-Regular, sans-serif;
  }
`

export const shadow = css`
  box-shadow: 3px 3px 25px #0000001C;
`

export const buttonCss = css`
  color: ${props => props.theme.textColor};
  border-radius: 0.3em;
  border: none;
  padding: 0.5em 1.5em;
  margin: 1em;
  min-width: 100px;

  transition: all 0.2s;
  font-size: 1em;
  box-sizing: border-box;

  :hover {
    cursor: ${props => props.disabled ? 'not-allowed': 'pointer'};
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
  background: ${props => props.disabled ? props.theme.textColor + 'cf' : props.theme.textColor};
  color: ${props => props.theme.backgroundColor};
  
  :hover {
    background: ${props => props.theme.textColor + 'cf' };
  }
`

export const PrimaryButton = styled.button`
  ${buttonCss};
  
  background: ${props => props.disabled ? props.theme.backgroundColor + 'cf' : props.theme.backgroundColor};

  :hover {
    background: ${props => props.theme.backgroundColor + 'cf'};
    cursor: pointer;
  }
`

export const ConfirmButton = styled.button`
  ${buttonCss};
  background: ${props => props.theme.successColor};

  background: ${props => props.disabled ? props.theme.successColor + 'cf' : props.theme.successColor};

  :hover {
    background: ${props => props.theme.successColor + 'cf'};
    cursor: pointer;
  }
`

export const RejectButton = styled.button`
  ${buttonCss};
  background: ${props => props.theme.dangerColor};

  background: ${props => props.disabled ? props.theme.dangerColor + 'cf' : props.theme.dangerColor};

  :hover {
    background: ${props => props.theme.dangerColor + 'cf'};
    cursor: pointer;
  }
`