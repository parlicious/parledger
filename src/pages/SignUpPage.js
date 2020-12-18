import "./HomePage.css";
import {Box, Button, Card, CardBody, CardHeader, Header, Heading, Main, Paragraph} from "grommet";
import React from "react";
import {useFirebase, useFirestore} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";
import {useState} from "react/cjs/react.production.min";

export const SignUpPage = () => {
    const firebase = useFirebase()
    const firestore = useFirestore();
    const auth = useStoreState(state => state.firebase.auth)

    async function loginWithGoogle() {
        const credentials = await firebase.login({provider: 'google', type: 'popup'})
    }

    return (
        <Card background="brand" pad="medium">
            <CardHeader textAlign="center">
                <Heading
                    weight="bold"
                    size="large"
                    textAlign="center">
                    ledger.bet
                </Heading>
            </CardHeader>
            <CardBody>
                <Heading size="small">
                    make friendly bets
                </Heading>
                <Button
                    primary
                    label="Sign up with Google"
                    onClick={loginWithGoogle}/>
            </CardBody>
        </Card>
    )
}