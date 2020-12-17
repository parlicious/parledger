import './App.css';
import {isLoaded, ReactReduxFirebaseProvider} from "react-redux-firebase";
import {reactReduxFirebaseProps, store} from "./store";
import {StoreProvider, useStoreState} from "easy-peasy";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {HomePage} from "./pages/HomePage";
import {Grommet} from "grommet";

function AuthIsLoaded({children}) {
    const auth = useStoreState(state => state.firebase.auth)
    if (!isLoaded(auth)) return <div>splash screen...</div>;
    return children
}

const theme = {
    global: {
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";',
            size: '14px',
            height: '20px',
        },
    },
};

const App = () => {
    return (
        <Provider store={store}>
            <StoreProvider store={store}>
                <ReactReduxFirebaseProvider {...reactReduxFirebaseProps}>
                    <AuthIsLoaded>
                        <Grommet theme={theme}>
                            <BrowserRouter>
                                <Switch>
                                    <Route exact path='/'>
                                        <HomePage/>
                                    </Route>
                                </Switch>
                            </BrowserRouter>
                        </Grommet>
                    </AuthIsLoaded>
                </ReactReduxFirebaseProvider>
            </StoreProvider>
        </Provider>
    )
}
export default App
