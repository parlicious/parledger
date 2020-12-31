import {Event, Outcome} from "./SelectEvent";
import React from "react";


const OutcomeDescription = ({outcome}) => {
    console.log(outcome);
    if (outcome) {
        return (
            <span>
                {outcome.description}
                {outcome.price.handicap && <span >
                    {' ' + outcome.price.handicap + ' '}
                </span>}
                {!outcome.price.handicap && <span>
                    {' ' + outcome.price.american + ' '}
                </span>}
            </span>
        )
    } else {
        return <span/>
    }
}

const EventDescription = ({event, market, outcome}) => {
    const selectedMarket = event.displayGroups[0].markets[market];
    const selectedOutcome = selectedMarket.outcomes[outcome];
    const eventTime = new Date(event.startTime)
  return (
      <div>
          <div> For {event.description} on {eventTime.toLocaleDateString()} at {eventTime.toLocaleTimeString()}</div>
          <div>you picked <OutcomeDescription outcome={selectedOutcome}/> in a {selectedMarket.description} bet. </div>
      </div>
  )
};

export const ConfirmWager = ({selection, opponent}) => {
    const selectedOutcome = selection.event.displayGroups[0].markets[selection.market].outcomes[selection.outcome]
    return (
        <div>
            <div>
                Confirm your proposed bet with {opponent.displayName}
            </div>
            <Event event={selection.event}/>
        </div>
    )
}