import {useStoreState} from "easy-peasy";

export const PersonalWagers = ({}) => {
    const profile = useStoreState(state => state.firebase.profile);

    return (
        <div>
            <p>--- My Wagers ---</p>
            {Object.values(profile?.wagers ?? {})
                .filter(wager => wager.status !== 'rejected')
                .map(wager => <pre> {JSON.stringify(wager, 0, 2)} </pre>)}
        </div>
    )
}