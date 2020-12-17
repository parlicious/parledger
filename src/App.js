import './App.css';
import {isLoaded, ReactReduxFirebaseProvider} from "react-redux-firebase";
import {reactReduxFirebaseProps, store} from "./store";
import {TestComponent} from "./TestComponent";
import {StoreProvider, useStoreState} from "easy-peasy";
import {Provider} from "react-redux";
import {LoginPage} from "./pages/LoginPage";

function AuthIsLoaded({children}) {
    const auth = useStoreState(state => state.firebase.auth)
    if (!isLoaded(auth)) return <div>splash screen...</div>;
    return children
}

const App = () => {
    return (
        <Provider store={store}>
            <StoreProvider store={store}>
                <ReactReduxFirebaseProvider {...reactReduxFirebaseProps}>
                    <AuthIsLoaded>
                        <LoginPage/>
                    </AuthIsLoaded>
                </ReactReduxFirebaseProvider>
            </StoreProvider>
        </Provider>
    )
}
export default App
