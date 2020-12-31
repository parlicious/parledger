import {isLoaded, isEmpty, useFirebase} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";
import {Redirect, useHistory} from 'react-router-dom';
import {StyledFirebaseAuth} from "react-firebaseui";
import {JoinGroupPage} from "./JoinGroupPage";
import React, {useState} from "react";

// Configure FirebaseUI.

export function LoginPage({signup}) {
    const firebase = useFirebase()
    const auth = useStoreState(state => state.firebase.auth)
    const [authLoaded, setAuthLoaded] = useState(false);
    const history = useHistory();
    const uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                firebase.handleRedirectResult(authResult).then(() => {
                    console.log('logged in');
                    setAuthLoaded(true);
                });
                return false;
            },
        },
    };

    return (
        <div>
            <div>
                {
                    !isLoaded(auth)
                        ? <span>Loading...</span>
                        : isEmpty(auth)
                        ? <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
                        : signup
                            ? <JoinGroupPage/>
                            : <Redirect to={{pathname: "/home",}}/>
                }
            </div>
        </div>
    )
}
