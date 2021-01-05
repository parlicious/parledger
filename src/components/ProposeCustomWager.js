import styled, {css} from "styled-components";
import {useForm} from "react-hook-form";
import React, {useState} from 'react';
import {useStoreActions, useStoreState} from "easy-peasy";
import {AppCell} from "../pages/NewWagerPage";
import {useSaveWager} from "../stores/wagers";
import {Redirect} from "react-router-dom";
import {InlineLink} from "../styles";

const customAmountInputCss = css`
  color: white;
  font-size: 1.2em;
  background: none;
  padding: 0.3em;
`

const CustomAmountInputField = styled.input`
  ${customAmountInputCss};
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  border-left: none;
  border-right: 1px solid var(--border-color);

  border-radius: 0 0.3em 0.3em 0;
  width: 100%;
  flex-grow: 1;

  :focus {
    outline: none;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    border-left: none;
    border-right: 1px solid var(--border-color);
  }
`

const CustomAmountInputCurrency = styled.div`
  ${customAmountInputCss};
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  border-right: none;

  border-radius: 0.3em 0 0 0.3em;
`

const WagerAmount = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 1em 0;
`

const WagerDescription = styled.div`
  grid-column-start: 1;
  grid-column-end: 3;

  display: flex;
  flex-direction: column;
`

const WagerDescriptionTextArea = styled.textarea`
  font-family: Avenir, sans-serif;
  color: white;
  font-size: 1.2em;
  background: none;
  padding: 0.3em;
  border: 1px solid white;
`

const CustomWagerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
`

const SubmitRow = styled.div`
  grid-column-start: 1;
  grid-column-end: 3;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 1em;
`

const SubmitBetButton = styled.button`
  border-radius: 0.3em;
  color: white;
  font-size: 1.2em;
  padding: 0.3em;
  width: 50%;
  border: 1px solid white;
  background: none;

  :hover {
    cursor: pointer;
    background: #FFFFFF13;
  }
`

const CustomAmountWrapper = styled.div`
  --border-color: white;
  display: flex;
  flex-direction: row;
  text-align: start;

  :focus-within {
    --border-color: #afafaf;
  }
`

const ErrorMessage = styled.div`
  color: #FF4040;
`

const SuccessMessage = styled.div`
  color: #00C781;
`

const CustomAmountInput = (props) => {
    const {register} = props;
    return (
        <CustomAmountWrapper>
            <CustomAmountInputCurrency> $ </CustomAmountInputCurrency>
            <CustomAmountInputField ref={register} {...props}/>
        </CustomAmountWrapper>
    )
}

export const ProposeCustomWager = ({}) => {
    const opponent = useStoreState(state => state.wagers.new.opponent);
    const {handleSubmit, setValue, control, errors, register, watch, formState} = useForm();

    const watchRisk = watch('risk');

    if (!formState.dirtyFields.toWin) {
        setValue('toWin', watchRisk);
    }

    const {submitting, apiError, apiSuccess, save} = useSaveWager()

    if (opponent === null) {
        return <Redirect to={'/wagers/new'}/>
    }

    const onSubmit = async (data) => save({
        risk: data.risk,
        toWin: data.toWin,
        details: {description: data.wagerDescription},
        opponent: opponent,
        type: 'CUSTOM'
    });


    const getFormErrorMessage = (errors) => {
        const messages = {
            wagerDescription: "Must provide a wager description",
            risk: "Must enter an amount to risk",
            toWin: "Must enter an amount to win",
        }

        return messages[Object.keys(errors)[0]]
    }

    return (
        <AppCell>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CustomWagerContainer>
                    <WagerAmount>
                        Risk
                        <CustomAmountInput
                            register={register({required: true})}
                            name='risk'
                        />
                        {errors.risk && <ErrorMessage>
                            {getFormErrorMessage(errors)}
                        </ErrorMessage>}
                    </WagerAmount>

                    <WagerAmount>
                        To Win
                        <CustomAmountInput
                            register={register({required: true, defaultValue: watchRisk})}
                            name='toWin'
                        />
                        {(errors.toWin && !errors.risk) && <ErrorMessage>
                            {getFormErrorMessage(errors)}
                        </ErrorMessage>}
                    </WagerAmount>

                    <WagerDescription>
                        Description
                        {errors.wagerDescription && <ErrorMessage>
                            {getFormErrorMessage(errors)}
                        </ErrorMessage>}
                        <WagerDescriptionTextArea
                            register={register({required: true})}
                            name='wagerDescription'/>

                    </WagerDescription>
                    {apiSuccess
                        ? <SubmitRow>
                            <SuccessMessage>
                                {apiSuccess}
                            </SuccessMessage>
                            <InlineLink to={'/home'}>Go Home</InlineLink>
                        </SubmitRow>
                        : (apiError && !formState.isDirty)
                            ? <SubmitRow>
                                <ErrorMessage>
                                    {apiError}
                                </ErrorMessage>
                            </SubmitRow>

                            : <SubmitRow>
                                <SubmitBetButton type="submit">
                                    Submit
                                </SubmitBetButton>
                            </SubmitRow>
                    }
                </CustomWagerContainer>
            </form>
        </AppCell>
    )
}