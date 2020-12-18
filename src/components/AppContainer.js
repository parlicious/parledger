import React from "react";
import {
    Anchor,
    Avatar,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    DropButton,
    Header,
    Heading,
    Main,
    Text
} from "grommet";
import {useStoreState} from "easy-peasy";
import {isEmpty, useFirebase} from "react-redux-firebase";
import {Link} from 'react-router-dom';

const AvatarMenu = ({profile, logout}) => {
    return (
        <DropButton
            focusIndicator={false}
            dropAlign={{ top: 'bottom', right: 'right' }}
            dropContent={
                <Box background="accent-1" pad="small" round="xsmall" gap="xsmall">
                    <Anchor as={Link} to="/me">
                        Profile
                    </Anchor>
                    <Anchor onClick={logout}> Sign Out </Anchor>
                </Box>
            }
        >
            {profile.avatarUrl
                ? <Avatar
                    src={profile.avatarUrl}
                />
                : <Text alignSelf="center">
                    <Anchor as={Link} to="/me">
                        {profile.displayName}
                    </Anchor>
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

    const logIn = async () => {
        await firebase.login({provider: 'google', type: 'popup'})
    }

    return (<React.Fragment>
        <Header background="brand" pad="small">
            <Heading level={3}>
                <Anchor as={Link} to="/">
                    ledger.bet
                </Anchor>
            </Heading>
            {isEmpty(auth)
                ? <Button label="Log In" onClick={logIn}/>
                : <Box direction="row" alignContent="between" gap="small" justify="center">
                    <AvatarMenu profile={profile} logout={logOut}/>
                </Box>}
        </Header>
        <Main pad="large">
            {props.children}
        </Main>
    </React.Fragment>)
}
