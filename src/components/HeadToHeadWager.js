import {useState} from "react";
import {useStoreState} from "easy-peasy";
import {UserAvatar} from "./UserAvatar";
import {Wager} from "./wagers/Wager";

const CondensedBovadaWager = (props) => {
    const {wager} = props;
    const usersByUid = useStoreState(state => state.users.avatarUrlsByUid);

    return (
        <div>
        <div>
            <UserAvatar user={usersByUid[wager.proposedBy.uid]}/>
            vs.
            <UserAvatar user={usersByUid[wager.proposedTo.uid]}/>
        </div>
            {wager.details.description || wager.details}
        </div>
    )
}

export const HeadToHeadWager = (props) => {
    const {wager} = props;

    const [expanded, setExpanded] = useState(true);

    if (expanded) {
        return (
            <Wager {...props}/>
        )
    } else {
        return <CondensedBovadaWager {...props}/>
    }
}