import React from "react";
import {Anchor, Avatar, Box, Button, DropButton, Header, Heading, Main, Text} from "grommet";
import {useStoreState} from "easy-peasy";
import {isEmpty, useFirebase} from "react-redux-firebase";
import {Link} from 'react-router-dom';

const AvatarMenu = ({profile, logout}) => {
    return (
        <DropButton
            focusIndicator={false}
            dropAlign={{top: 'bottom', right: 'right'}}
            dropContent={
                <Box background="accent-1" pad="small" round="xsmall" gap="xsmall">
                    <Link to="/me">
                        <Anchor as="span">
                            Profile
                        </Anchor>
                    </Link>
                    <Anchor onClick={logout}> Sign Out </Anchor>
                </Box>
            }
        >
            {profile.avatarUrl
                ? <Avatar
                    src={profile.avatarUrl}
                />
                : <Text alignSelf="center">
                    <Link to="/me">
                        <Anchor as="span">
                            {profile.displayName || "Profile"}
                        </Anchor>
                    </Link>
                </Text>
            }
        </DropButton>
    )
}

export const AppContainer = (props) => {
    const auth = useStoreState(state => state.firebase.auth);
    const profile = useStoreState(state => state.firebase.profile);
    const firebase = useFirebase();

    const logOut = async () => {
        await firebase.logout();
    }

    return (<React.Fragment>
        <Header background="brand" pad="small">
            <Heading level={3}>
                <Link to='/'>
                    <Anchor as={'span'}>
                        ledger.bet
                    </Anchor>
                </Link>
            </Heading>
            {isEmpty(auth)
                ? <Link to='/login'><Button as="span" label="Log In"/></Link>
                : <Box direction="row" alignContent="between" gap="small" justify="center">
                    <AvatarMenu profile={profile} logout={logOut}/>
                </Box>}
        </Header>
        <Main pad="large">
            {props.children}
        </Main>
    </React.Fragment>)
}
