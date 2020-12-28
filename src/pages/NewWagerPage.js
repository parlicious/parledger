import {Box, Button, Form, FormField, Select, TextInput} from "grommet";
import {useStoreState} from "easy-peasy";
import {useFirestoreConnect} from "react-redux-firebase";
import {useForm, Controller} from "react-hook-form";

export const NewWagerPage = () => {
    const profile = useStoreState(state => state.firebase.profile)
    useFirestoreConnect(profile?.groups?.map(g => ({collection: `groups/${g}/members`, storeAs: 'members'})));
    const members = useStoreState(state => state.firestore.data.members)

    const {handleSubmit, control} = useForm();
    const options = Object.keys(members || {}).map(k => ({...members[k], value: members[k].displayName}))
    const onSubmit = (data) => console.log(data);

    return (
        <Box>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Propose a wager to: ">
                    <Controller
                        defaultValue=""
                        name="proposedTo"
                        control={control}
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
                </FormField>
                <FormField label="What are you proposing?">
                <Controller
                    defaultValue=""
                    name="wagerDescription"
                    control={control}
                    render={(
                        {onChange, onBlur, value, name, ref},
                        {invalid, isTouched, isDirty}
                    ) => <TextInput defaultValue="" onChange={onChange}/>
                    }
                />
                </FormField>
                <Button primary label='submit' type='submit'/>
            </Form>
        </Box>
    )
}