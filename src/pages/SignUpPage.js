import "./HomePage.css";
import {Button, Card, CardBody, CardHeader, Heading} from "grommet";
import React from "react";
import {useFirebase} from "react-redux-firebase";

export const SignUpPage = () => {
    const firebase = useFirebase()

    async function loginWithGoogle() {
        await firebase.login({provider: 'google', type: 'popup'})
    }

    return (
        <Card background="brand" pad="medium">
            <CardHeader textAlign="center">
                <Heading
                    weight="bold"
                    size="large"
                    color="focus"
                    textAlign="center">
                    ledger.bet
                </Heading>
            </CardHeader>
            <CardBody>
                <Heading color="focus" size="small">
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