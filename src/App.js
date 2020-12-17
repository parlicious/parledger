import './App.css';
import {isLoaded, ReactReduxFirebaseProvider} from "react-redux-firebase";
import {reactReduxFirebaseProps, store} from "./store";
import {StoreProvider, useStoreState} from "easy-peasy";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {HomePage} from "./pages/HomePage";

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
                        <BrowserRouter>
                                <Switch>
                                    <Route exact path='/'>
                                        <HomePage/>
                                    </Route>
                                </Switch>
                        </BrowserRouter>
                    </AuthIsLoaded>
                </ReactReduxFirebaseProvider>
            </StoreProvider>
        </Provider>
    )
}
export default App
