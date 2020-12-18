import {Route, Redirect} from 'react-router-dom';
import {isLoaded, isEmpty} from "react-redux-firebase"
import {useStoreState} from 'easy-peasy';

export function PrivateRoute({children, ...rest}) {
    const auth = useStoreState(state => state.firebase.auth)
    return (
        <Route
            {...rest}
            render={({location}) =>
                isLoaded(auth) && !isEmpty(auth) ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: {from: location}
                        }}
                    />
                )
            }
        />
    );
}