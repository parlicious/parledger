import "./HomePage.css";
import React from "react";
import signUpImage from "../resources/undraw_Savings_re_eq4w.svg"
import styled from 'styled-components';
import {useHistory, Redirect} from 'react-router-dom';
import {useStoreState} from "easy-peasy";
import {isEmpty, isLoaded} from "react-redux-firebase";

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

const SignUpPageImageContainer = styled.div`
  padding-left: 1em;
  place-self: center center;
  height: 100%;
`

const SignUpPageImage = styled.img`
  width: 100%;
`

export const SignUpButton = styled.button`
  border-radius: 0.3em;
  color: ${props => props.theme.interfaceColor};
  font-size: 1.2em;
  padding: 0.3em;
  border: 1px solid ${props => props.theme.interfaceColor};
  background: none;
  
  max-width: 200px;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

export const SignUpPage = () => {
    const history = useHistory();
    const auth = useStoreState(state => state.firebase.auth)

    async function loginWithGoogle() {
        history.push('/signup')
    }

    if(isLoaded(auth) && !isEmpty(auth)){
        return <Redirect to={'/home'}/>
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