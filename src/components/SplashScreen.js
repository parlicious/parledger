import styled from 'styled-components';
import signUpImage from "../resources/undraw_Savings_re_eq4w.svg"

export const LoadingImage = styled.img`
  animation: sk-scaleout 2.0s infinite ease-in-out;
  
  width: 50%;

  @keyframes sk-scaleout {
    0% {
      transform: scale(0.8);
    }
    50% {
      -webkit-transform: scale(1.0);
      transform: scale(1.0);
      opacity: 0.8;
    }
    100% {
      transform: scale(0.8);
    }
  }
`

const SplashScreenContainer = styled.div`
  width: 100vh;
  height: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const SplashScreen = () => {
    return (
        <SplashScreenContainer>
            <LoadingImage src={signUpImage}/>
        </SplashScreenContainer>
    )
}