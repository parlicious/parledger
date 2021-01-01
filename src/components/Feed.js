import {useFirestoreConnect} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";
import {GroupWagers, PersonalWagers, useGroupWagers} from "./PersonalWagers";

export const Feed = () => {
    return (
        <div>
            <PersonalWagers/>
            <GroupWagers/>
        </div>
    )
}