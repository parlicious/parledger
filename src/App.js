import './App.css';
import {isLoaded, ReactReduxFirebaseProvider} from "react-redux-firebase";
import {reactReduxFirebaseProps, store} from "./store";
import {StoreProvider, useStoreState} from "easy-peasy";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {SignUpPage} from "./pages/SignUpPage";
import {Grommet} from "grommet";
import {theme} from './theme';
import {AppContainer} from "./components/AppContainer";
import {UserInfoPage} from "./pages/UserInfoPage";
import {PrivateRoute} from "./components/PrivateRoute";

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
                        <Grommet theme={theme}>
                            <BrowserRouter>
                                <AppContainer>
                                    <Switch>
                                        <Route exact path='/'>
                                            <SignUpPage/>
                                        </Route>
                                        <PrivateRoute path='/me'>
                                            <UserInfoPage/>
                                        </PrivateRoute>
                                    </Switch>
                                </AppContainer>
                            </BrowserRouter>
                        </Grommet>
                    </AuthIsLoaded>
                </ReactReduxFirebaseProvider>
            </StoreProvider>
        </Provider>
    )
}
export default App
