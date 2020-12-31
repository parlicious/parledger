import "./HomePage.css";
import React from "react";
import {useFirebase} from "react-redux-firebase";
import signUpImage from "../resources/undraw_Savings_re_eq4w.svg"
import blob from "../resources/blob_white.svg"
import styled, {css} from 'styled-components';
import {useHistory} from 'react-router-dom';

const SignUpPageContainer = styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: 1fr 1fr;
  
  max-width: 1000px;
  margin: auto;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const CtaContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const imageCss = css`
  position: absolute;
  width: 50%;
  top: 10em;
  right: 1em;
`

const SignUpPageImageContainer = styled.div`
  padding-left: 1em;
  place-self: center center;
  height: 100%;
`

const SignUpPageImage = styled.img`
  width: 100%;
`

const SignUpButton = styled.button`
  border-radius: 0.3em;
  color: white;
  font-size: 1.2em;
  padding: 0.3em;
  border: 1px solid white;
  background: none;
  
  max-width: 200px;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

export const SignUpPage = () => {
    const firebase = useFirebase()
    const history = useHistory();

    async function loginWithGoogle() {
        history.push('/signup')
    }

    return (
        <SignUpPageContainer>

            <CtaContainer>
                <h1>ledger.bet</h1>
                <h3>
                    make friendly bets
                </h3>
                <SignUpButton onClick={loginWithGoogle}>Sign Up</SignUpButton>
            </CtaContainer>
            <SignUpPageImageContainer>
                <SignUpPageImage src={signUpImage}/>
            </SignUpPageImageContainer>
        </SignUpPageContainer>
    )
}