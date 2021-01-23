import {ProposedEvent} from "../events/ProposedEvent";
import {WagerDescription} from "./WagerDescription";
import {InlineWagerActions} from "./InlineWagerActions";
import {membersFromWager} from "./Wager";


export const BovadaWager = (props) => {
    const {wager} = props;
    const selection = wager.details.selection || wager.details;
    return <ProposedEvent
        members={membersFromWager(wager)}
        displayGroup={wager.details.displayGroup || 0}
        header={
            <WagerDescription
                wager={wager}
                pending={wager.status === 'pending'}
                eventDescription={selection.event.description}
                risk={wager.details.risk}/>
        }
        footer={<InlineWagerActions {...props} />}
        event={selection.event}
        market={selection.market}
        outcome={selection.outcome}
    />
}