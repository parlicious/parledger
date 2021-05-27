import {Route, Redirect} from 'react-router-dom';
import {isLoaded, isEmpty} from "react-redux-firebase"
import {useStoreActions, useStoreState} from 'easy-peasy';
import React, {useEffect} from 'react';
import LogRocket from 'logrocket';

export function PrivateRoute({children, ...rest}) {
    const auth = useStoreState(state => state.firebase.auth)
    const profile = useStoreState(state => state.firebase.profile);
    const initGroup = useStoreActions(actions => actions.users.loadActiveGroup);
    const userHasJoined = profile?.groups?.length > 0;

    if (isLoaded(auth) && !isEmpty(auth) && userHasJoined) {
        LogRocket.identify(auth.uid, {
            name: profile.displayName,
            email: profile.email,
        });
    }

    useEffect(() => {
        if (isLoaded(auth) && !isEmpty(auth) && userHasJoined) {
            initGroup();
        }
    }, [auth])

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