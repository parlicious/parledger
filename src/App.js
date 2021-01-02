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
import {SplashScreen} from "./components/SplashScreen";

function AuthIsLoaded({children}) {
    const auth = useStoreState(state => state.firebase.auth)
    const profile = useStoreState(state => state.firebase.profile)
    // if(true) return <SplashScreen/>
    if (!isLoaded(profile)) return <SplashScreen/>
    if (!isLoaded(auth)) return <SplashScreen/>
    return children
}

const App = () => {
    return (
        <Provider store={store}>
            <StoreProvider store={store}>
                <ReactReduxFirebaseProvider {...reactReduxFirebaseProps}>

                    <BrowserRouter>
                        <AppContainer>
                            <Switch>
                                <Route exact path='/'>
                                    <SignUpPage/>
                                </Route>
                                <Route exact path='/login'>
                                    <LoginPage/>
                                </Route>
                                <Route exact path='/signup'>
                                    <LoginPage signup={true}/>
                                </Route>
                                <Route exact path='/groups/join'>
                                    <JoinGroupPage/>
                                </Route>
                                <Route exact path='/groups/join/:joinCode'>
                                    <JoinGroupPage/>
                                </Route>
                                <AuthIsLoaded>
                                    <PrivateRoute exact path='/home'>
                                        <HomePage/>
                                    </PrivateRoute>
                                    <PrivateRoute path='/me'>
                                        <UserInfoPage/>
                                    </PrivateRoute>
                                    <PrivateRoute exact path='/wagers/new'>
                                        <NewWagerPage/>
                                    </PrivateRoute>
                                </AuthIsLoaded>
                            </Switch>
                        </AppContainer>
                    </BrowserRouter>
                </ReactReduxFirebaseProvider>
            </StoreProvider>
        </Provider>
    )
}
export default App
