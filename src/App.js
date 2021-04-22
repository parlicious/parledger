import './App.css';
import './resources/icons.css'
import {isLoaded, ReactReduxFirebaseProvider} from "react-redux-firebase";
import {reactReduxFirebaseProps, store} from "./stores/store";
import {StoreProvider, useStoreActions, useStoreRehydrated, useStoreState} from "easy-peasy";
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
import {ManageWager} from "./components/ManageWager";
import {SelectEvent} from "./components/SelectEvent";
import {ConfirmWagerProposal} from "./components/ConfirmWagerProposal";
import {SelectWagerType} from "./components/SelectWagerType";
import {ProposeCustomWager} from "./components/ProposeCustomWager";
import {Marketplace} from "./components/Marketplace";
import {Me} from "./components/Me";
import {SelectPoolsPage} from './pages/SelectPoolsPage';
import {PoolsPage} from './components/pools/PoolsPage';
import {SelectGroupPage} from './pages/SelectGroupPage';
import {ThemeProvider} from 'styled-components';
import {GlobalStyle, theme} from './styles';

function AuthIsLoaded({children}) {
    const auth = useStoreState(state => state.firebase.auth)
    const profile = useStoreState(state => state.firebase.profile)
    const isRehydrated = useStoreRehydrated();

    // if(true) return <SplashScreen/>
    if (!isRehydrated) return <SplashScreen/>
    if (!isLoaded(profile)) return <SplashScreen/>
    if (!isLoaded(auth)) return <SplashScreen/>

    return children
}

const App = () => {
    return (
        <Provider store={store}>
            <StoreProvider store={store}>
                <ThemeProvider theme={theme}>
                    <GlobalStyle/>
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
                                        <Route exact path='/groups'>
                                            <SelectGroupPage/>
                                        </Route>
                                        <PrivateRoute exact path='/home'>
                                            <HomePage/>
                                        </PrivateRoute>
                                        <PrivateRoute path='/me'>
                                            <UserInfoPage/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/market'>
                                            <Marketplace/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/mine'>
                                            <Me/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/new'>
                                            <NewWagerPage/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/new/type'>
                                            <SelectWagerType/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/new/sports'>
                                            <SelectEvent/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/new/custom'>
                                            <ProposeCustomWager/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/new/confirm'>
                                            <ConfirmWagerProposal/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/wagers/manage/:wagerId'>
                                            <ManageWager/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/pools'>
                                            <SelectPoolsPage/>
                                        </PrivateRoute>
                                        <PrivateRoute exact path='/pools/:poolId'>
                                            <PoolsPage/>
                                        </PrivateRoute>
                                    </AuthIsLoaded>
                                </Switch>
                            </AppContainer>
                        </BrowserRouter>
                    </ReactReduxFirebaseProvider>
                </ThemeProvider>
            </StoreProvider>
        </Provider>
    )
}
export default App
