import {Route, Redirect} from 'react-router-dom';
import {isLoaded, isEmpty} from "react-redux-firebase"
import {useStoreActions, useStoreState} from 'easy-peasy';
import React from 'react';

export function PrivateRoute({children, ...rest}) {
    const auth = useStoreState(state => state.firebase.auth)
    const profile = useStoreState(state => state.firebase.profile);
    const userHasJoined = profile?.groups?.length > 0;

    return (
        !isLoaded(profile)
            ? <span> Loading... </span>
            : <Route
                {...rest}
                render={({location}) =>
                    (isLoaded(auth) && !isEmpty(auth) && userHasJoined) ? (
                        children
                    ) : (
                        <React.Fragment>
                            {!userHasJoined
                                ? <Redirect
                                    to={{
                                        pathname: "/groups/join",
                                        state: {from: location}
                                    }}
                                />
                                : <Redirect
                                    to={{
                                        pathname: "/",
                                        state: {from: location}
                                    }}
                                />}

                        </React.Fragment>
                    )
                }
            />
    );
}