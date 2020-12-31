import './App.css';
import {isLoaded, ReactReduxFirebaseProvider} from "react-redux-firebase";
import {reactReduxFirebaseProps, store} from "./stores/store";
import {StoreProvider, useStoreState} from "easy-peasy";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {SignUpPage} from "./pages/SignUpPage";
import {AppContainer} from "./components/AppContainer";
import {UserInfoPage} from "./pages/UserInfoPage";
import {PrivateRoute} from "./components/PrivateRoute";
import {LoginPage} from "./pages/LoginPage";
import {HomePage} from "./pages/HomePage";
import {JoinGroupPage} from "./pages/JoinGroupPage";
import {NewWagerPage} from "./pages/NewWagerPage";

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
                                <AppContainer>
                                    <Switch>
                                        <Route exact path='/'>
                                            <SignUpPage/>
                                        </Route>
                                        <Route exact path='/login'>
                                            <LoginPage/>
                                        </Route>
                                        <PrivateRoute exact path='/home'>
                                            <HomePage/>
                                        </PrivateRoute>
                                        <PrivateRoute path='/me'>
                                            <UserInfoPage/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/new'>
                                            <NewWagerPage/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/groups/join'>
                                            <JoinGroupPage/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/groups/join/:joinCode'>
                                            <JoinGroupPage/>
                                        </PrivateRoute>
                                    </Switch>
                                </AppContainer>
                            </BrowserRouter>
                    </AuthIsLoaded>
                </ReactReduxFirebaseProvider>
            </StoreProvider>
        </Provider>
    )
}
export default App
