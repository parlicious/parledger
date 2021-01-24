import {WagerDescription} from "./WagerDescription";
import {InlineWagerActions} from "./InlineWagerActions";
import {membersFromWager} from "./Wager";
import {TwoWayWager} from "./TwoWayWager";
import {OddsCell, SelectableOddsCellContainer} from "../events/commonEventComponents";
import {Outcome} from "../events/Outcome";
import {RankOutcome} from "../events/RankEvent";


const BovadaTwoWayGameEventWager = (props) => {
    const {event, displayGroup = 0, market = 0, members, outcome, header, footer} = props;
    const eventTime = new Date(event.startTime);
    const [first, second] = event?.awayTeamFirst ?
        [{competitor: 1, rowNum: 0}, {competitor: 0, rowNum: 1}] :
        [{competitor: 0, rowNum: 0}, {competitor: 1, rowNum: 1}];

    const outcomes = event.displayGroups[displayGroup].markets[market]?.outcomes
        ?? event.displayGroups[displayGroup].originalMarkets[market]?.outcomes;


    /*
    Two way game event bovada wagers have this asinine way of determining who is on what side,
    we save the index of the outcome selected by the person proposing the bet, then
    assume the other person is the other outcome.
     */
    const memberDetails = (member) => ({
        name: <OddsCell> {outcomes[member.rowNum].description} </OddsCell>,
        choice:
            <SelectableOddsCellContainer> {members[member.rowNum]?.displayName ?? 'Anyone'} </SelectableOddsCellContainer>,
        odds: <SelectableOddsCellContainer> <Outcome outcomes={outcomes} outcome={member.rowNum}/>
        </SelectableOddsCellContainer>
    })

    return <TwoWayWager
        header={header}
        footer={footer}
        wagerTime={eventTime}
        proposedToDetails={memberDetails(first)}
        proposedByDetails={memberDetails(second)}
    />
}

const BovadaTwoWayRankEventWager = (props) => {
    const {event, displayGroup = 0, market = 0, members, outcome, header, footer} = props;

    /*
    Two way rank event bovada wagers are where one person picks an outcome, and the other picks the field
    so the proposedBy person has the selected outcome, whereas the proposedTo person has the field.
    */
    const proposedByMemberDetails = {
        name: <OddsCell> {event.description} </OddsCell>,
        choice:
            <SelectableOddsCellContainer> {members.proposedBy.displayName} </SelectableOddsCellContainer>,
        odds: <SelectableOddsCellContainer> <RankOutcome outcome={outcome}/> </SelectableOddsCellContainer>
    }

    const proposedToMemberDetails = {
        name: <OddsCell> {event.description} </OddsCell>,
        choice:
            <SelectableOddsCellContainer> {members.proposedTo.displayName} </SelectableOddsCellContainer>,
        odds: <SelectableOddsCellContainer> The Field </SelectableOddsCellContainer>
    }

    return <TwoWayWager
        header={header}
        footer={footer}
        proposedByDetails={proposedByMemberDetails}
        proposedToDetails={proposedToMemberDetails}
        wagerTime={new Date()}
    />
}

export const BovadaWager = (props) => {
    const {wager} = props;
    const selection = wager.details.selection || wager.details;

    const header = <WagerDescription
        wager={wager}
        pending={wager.status === 'pending'}
        eventDescription={selection.event.description}
        risk={wager.details.risk}/>

    if (selection.event.type === 'GAMEEVENT') {
        return <BovadaTwoWayGameEventWager
            {...selection}
            header={header}
            members={membersFromWager(wager)}
            footer={<InlineWagerActions {...props} />}
        />
    } else if (selection.event.type === 'RANKEVENT') {
        return <BovadaTwoWayRankEventWager
            {...selection}
            header={header}
            members={{proposedBy: wager.proposedBy, proposedTo: wager.proposedTo}}
            footer={<InlineWagerActions {...props} />}
        />
    }
}