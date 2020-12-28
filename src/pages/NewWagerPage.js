import {Box, Button, Form, Select, Text, TextInput} from "grommet";
import {useStoreActions, useStoreState} from "easy-peasy";
import {useFirestoreConnect} from "react-redux-firebase";
import {Controller, useForm} from "react-hook-form";
import {PulseSpinner} from "../components/PulseSpinner";
import {useState} from 'react';

export const NewWagerPage = () => {
    const [submitting, setSubmitting] = useState(false);
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect(profile?.groups?.map(g => ({collection: `groups/${g}/members`, storeAs: 'members'})));
    const members = useStoreState(state => state.firestore.data.members)
    const {handleSubmit, control, errors} = useForm();

    const createWager = useStoreActions(actions => actions.wagers.createWager);

    const options = Object.keys(members || {}).map(k => members[k])
    const onSubmit = async (data) => {
        const wager = {
            proposedTo: data.proposedTo.uid,
            groupId: profile.groups[0],
            details: {
                description: data.wagerDescription,
                risk: data.proposedByWagerAmount,
                win: data.proposedToWagerAmount
            }
        }
        await createWager(wager);
        setSubmitting(!submitting);
    }

    const getFormErrorMessage = (errors) => {
        const messages = {
            proposedTo: "Must select someone to propose the bet to",
            wagerDescription: "Must provide a wager description",
            proposedByWagerAmount: "Must enter an amount to risk",
            proposedToWagerAmount: "Must enter an amount to win",
        }

        return messages[Object.keys(errors)[0]]
    }

    return (
        <Box>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Box direction="column" gap="small" justify="center">
                    <Box direction="row" justify="center" gap="large">
                        <Text alignSelf="center" size="xlarge">
                            Propose a bet with
                        </Text>
                        <Controller
                            defaultValue=""
                            name="proposedTo"
                            control={control}
                            rules={{required: true}}
                            render={(
                                {onChange, onBlur, value, name, ref},
                                {invalid, isTouched, isDirty}
                            ) => (<Select
                                ref={ref}
                                value={value}
                                onChange={e => onChange(e.value)}
                                labelKey={'displayName'}
                                options={options}>
                                {/*{options.map(member => <option key={member.uid} value={member.uid}>{member.displayName}</option>)}*/}
                            </Select>)}
                        />

                    </Box>
                    <Box direction="row" justify="center" gap="large">
                        <Text alignSelf="center" size="xlarge">
                            that
                        </Text>
                        <Box width="large">
                            <Controller
                                defaultValue=""
                                rules={{required: true}}
                                name="wagerDescription"
                                control={control}
                                render={(
                                    {onChange, onBlur, value, name, ref},
                                    {invalid, isTouched, isDirty}
                                ) => <TextInput defaultValue="" placeholder="Enter your bet here" onChange={onChange}/>
                                }
                            />
                        </Box>
                    </Box>


                    <Box direction="row" justify="center" gap="large">
                        <Text alignSelf="center" size="xlarge">
                            Risking
                        </Text>
                        <Box direction="row" width="small">
                            <Text alignSelf="center" size="xlarge">
                                $
                            </Text>
                            <Controller
                                defaultValue=""
                                rules={{required: true}}
                                name="proposedByWagerAmount"
                                control={control}
                                render={(
                                    {onChange, onBlur, value, name, ref},
                                    {invalid, isTouched, isDirty}
                                ) => <TextInput width="small" type="number" defaultValue="" onChange={onChange}/>
                                }
                            />
                        </Box>
                        <Text alignSelf="center" size="xlarge">
                            To Win
                        </Text>
                        <Box direction="row" width="small">
                            <Text alignSelf="center" size="xlarge">
                                $
                            </Text>
                            <Controller
                                defaultValue=""
                                rules={{required: true}}
                                name="proposedToWagerAmount"
                                control={control}
                                render={(
                                    {onChange, onBlur, value, name, ref},
                                    {invalid, isTouched, isDirty}
                                ) => <TextInput width="small" type="number" defaultValue="" onChange={onChange}/>
                                }
                            />
                        </Box>
                    </Box>
                    <Box>
                        <Text color="status-error">{getFormErrorMessage(errors)}</Text>
                    </Box>
                    {submitting && <PulseSpinner/>}
                    <Button justify="center" primary label='submit' type='submit'/>
                </Box>
            </Form>
        </Box>
    )
}