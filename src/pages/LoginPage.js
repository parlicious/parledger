import {isLoaded, isEmpty, useFirebase} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";
import {useHistory} from 'react-router-dom';
import {StyledFirebaseAuth} from "react-firebaseui";

// Configure FirebaseUI.

export function LoginPage () {
    const firebase = useFirebase()
    const auth = useStoreState(state => state.firebase.auth)
    const history = useHistory();
    const uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
        signInSuccessUrl: '/signedIn',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                firebase.handleRedirectResult(authResult).then(() => {
                    history.push('/me');
                });
                return false;
            },
        },
    };

    return (
        <div  >
            <div >
                <h2>Auth</h2>
                {
                    !isLoaded(auth)
                        ? <span>Loading...</span>
                        : isEmpty(auth)
                        ?  <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                        : <pre>{JSON.stringify(auth, null, 2)}</pre>
                }
            </div>
        </div>
    )
}
