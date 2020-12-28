import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import styled from 'styled-components';

import {useStoreState} from "easy-peasy";
import {Link, useParams} from "react-router-dom"
import {isEmpty, useFirebase} from "react-redux-firebase";

const CreateGroupFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: start;
`

export const AocSubmit = styled.input.attrs({type: 'submit'})`
    background: transparent;
    border: 0;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    padding: 0;
    color: #009900;
    cursor: pointer;
    width: 20em;
    justify-content: start;
    text-align: start;
`

export const AocInput = styled.input`
    background: transparent;
    color: inherit;
    border: 1px solid #666666;
    background: #10101a;
    padding: 0 2px;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    width: 20em;
`

export const ErrorMessage = styled.span`
  color: #800000;
`

export const JoinGroupPage = ({...props}) => {
    const [submitting, setSubmiting] = useState();
    const {register, handleSubmit, errors} = useForm();
    const [createGroupError, setCreateGroupError] = useState(null);
    const [createGroupSuccess, setCreateGroupSuccess] = useState(null);
    const [allowDerivatives] = useState(true);
    const urlJoinCode = useParams()['joinCode'];
    const savedJoinCode = useStoreState(state => state.joinCode);
    const setJoinCode = () => {}
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
        return <div>
            <p> You must <Link to={'/login'}>[log in]</Link> to join a group</p>
        </div>
    } else {

        return (
            <div>
                <CreateGroupFormContainer onSubmit={handleSubmit(onSubmit)}>

                    <div>
                        <p>
                            ledger.bet is invite only. Enter the code for your group to join.
                        </p>
                    </div>
                    <span>
                        <input name="joinCode" defaultValue={joinCode} ref={register({required: true})}/>
                        {' '}
                        {(!submitting && !createGroupSuccess) && <button type='submit' value='Submit'/>}
                        {submitting && <span>submitting</span>}
                    </span>
                    {errors.joinCode &&
                    <ErrorMessage>You must enter the join code </ErrorMessage>}
                    <br/>
                    {createGroupError && <ErrorMessage>{createGroupError}</ErrorMessage>}
                    {createGroupSuccess &&
                    <span>You joined the group! <Link to={'/groups'}>[View your groups]</Link></span>}
                </CreateGroupFormContainer>
            </div>
        )
    }
}
