import {useFirestoreConnect} from "react-redux-firebase";
import {useStoreState} from "easy-peasy";
import {GroupWagers, PersonalWagers, useGroupWagers} from "./PersonalWagers";
import {AppCell} from "../pages/NewWagerPage";

export const Feed = () => {
    return (
        <AppCell>
            <GroupWagers/>
        </AppCell>
    )
}