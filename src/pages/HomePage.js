import "./HomePage.css";
import {Box, Button, Card, CardBody, CardHeader, Header, Heading, Main, Paragraph} from "grommet";
import React from "react";

export const HomePage = () => {
    return (
        <React.Fragment>
            <Header background="brand" pad="small">
                <Heading level={3}>ledger.bet</Heading>
                <Button secondary label="Sign Up"/>
            </Header>
            <Main pad="large">
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
                        <Button secondary label="Sign Up"/>
                    </CardBody>
                </Card>
            </Main>
        </React.Fragment>
    )
}