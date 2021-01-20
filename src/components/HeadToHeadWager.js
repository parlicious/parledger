import {useState} from "react";

export const HeadToHeadWager = (props) => {
    const {wager} = props;

    const [expanded, setExpanded] = useState(false);
    if (expanded) {
        return (
            <pre>
            {JSON.stringify(wager, null, 2)}
        </pre>
        )
    } else {
        return null;
    }
}

const CondensedBovadaWager = (props) => {
    const {wager} = props;
}