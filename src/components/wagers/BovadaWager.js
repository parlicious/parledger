import {ProposedEvent} from "./ProposedEvent";
import {WagerDescription} from "./WagerDescription";
import {InlineWagerActions} from "./InlineWagerActions";
import {membersFromWager} from "./Wager";
import {TwoWayWager} from "./TwoWayWager";
import {OddsCell, OddsContainer, SelectableOddsCellContainer} from "../events/commonEventComponents";
import {Outcome} from "../events/Outcome";



const BovadaTwoWayGameEventWager = (props) => {
    const {event, displayGroup = 0, market = 0, members, outcome} = props;
    const eventTime = new Date(event.startTime);
    const [first, second] = event?.awayTeamFirst ?
        [{competitor: 1, rowNum: 0}, {competitor: 0, rowNum: 1}] :
        [{competitor: 0, rowNum: 0}, {competitor: 1, rowNum: 1}];

    const outcomes = event.displayGroups[displayGroup].markets[market]?.outcomes
        ?? event.displayGroups[displayGroup].originalMarkets[market]?.outcomes;

    const memberDetails = (member) => ({
        name: <OddsCell> {outcomes[member.rowNum].description} </OddsCell>,
        choice: <SelectableOddsCellContainer> {members[member.rowNum]?.displayName ?? 'Anyone'} </SelectableOddsCellContainer>,
        odds: <SelectableOddsCellContainer> <Outcome outcomes={outcomes} outcome={member.rowNum}/> </SelectableOddsCellContainer>
    })

    return <TwoWayWager
        wagerTime={eventTime}
        proposedToDetails={memberDetails(first)}
        proposedByDetails={memberDetails(second)}
    />
}

const BovadaTwoWayRankEventWager = (props) => {

}

export const BovadaWager = (props) => {
    const {wager} = props;
    const selection = wager.details.selection || wager.details;
    const members = membersFromWager(wager);

    if(selection.event.type === 'GAMEEVENT'){
        return <BovadaTwoWayGameEventWager {...selection} members={members}/>
    }

    console.log(wager);

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