import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import styled from 'styled-components';

import {useStoreActions, useStoreState} from "easy-peasy";
import {Link, useParams} from "react-router-dom"
import {isEmpty, useFirebase} from "react-redux-firebase";
import {InlineLink} from "../styles";
import {SignUpButton, SignUpPage} from "./SignUpPage";
import {EventCell} from "../components/SelectEvent";
import {AppCell} from "./NewWagerPage";


export const ErrorMessage = styled.span`
  color: #800000;
`

const JoinCodeInput = styled.input`
  font-size: 1.17em;
  padding: 0.3em;
  box-shadow: 3px 3px 25px #0000001C;
  border: 0.3em;
  
  width: 80%;
  min-height: 40px;
  background: white;
  margin-top: 0.5em;
  border-radius: 0.3em;
`

const JoinCodeInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const JoinGroupPage = ({...props}) => {
    const [submitting, setSubmiting] = useState();
    const {register, handleSubmit, errors} = useForm();
    const [createGroupError, setCreateGroupError] = useState(null);
    const [createGroupSuccess, setCreateGroupSuccess] = useState(null);
    const [allowDerivatives] = useState(true);
    const urlJoinCode = useParams()['joinCode'];
    const savedJoinCode = useStoreState(state => state.users.joinCode);
    const setJoinCode = useStoreActions(actions => actions.users.setJoinCode);
    const auth = useStoreState(state => state.firebase.auth);
    const joinCode = urlJoinCode || savedJoinCode || "";
    const firebase = useFirebase();

    useEffect(() =>{
        if(urlJoinCode){
            setJoinCode(urlJoinCode);
        }
    }, [urlJoinCode])

    const onSubmit = async data => {
        setSubmiting(true);
        setCreateGroupError(null);
        setCreateGroupSuccess(null);
        try {
            await firebase.functions().httpsCallable('joinGroup')(
                {uid: auth.uid, allowDerivatives, ...data}
            )
            setCreateGroupSuccess(true);
        } catch (error) {
            setCreateGroupError(error.message);
        }
        setSubmiting(false);
    }

    if (isEmpty(auth)) {
        return <SignUpPage/>
    } else {

        return (
            <AppCell>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div>
                        <p>
                            ledger.bet is invite only. Enter the code for your group to join.
                        </p>
                    </div>
                    <JoinCodeInputContainer>
                        <JoinCodeInput name="joinCode" defaultValue={joinCode} ref={register({required: true})}/>
                        <br/>
                        {(!submitting && !createGroupSuccess) && <SignUpButton type='submit' value='Submit'>Submit</SignUpButton>}
                        {submitting && <span>submitting</span>}
                    </JoinCodeInputContainer>
                    {errors.joinCode &&
                    <ErrorMessage>You must enter the join code </ErrorMessage>}
                    <br/>
                    {createGroupError && <ErrorMessage>{createGroupError}</ErrorMessage>}
                    {createGroupSuccess &&
                    <span>You joined the group! <InlineLink to={'/home'}> Go Home </InlineLink></span>}
                </form>
            </AppCell>
        )
    }
}
