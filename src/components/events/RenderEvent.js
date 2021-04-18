import {RankEvent} from "./RankEvent";
import {GameEvent} from "./GameEvent";

export const RenderEvent = (props) => {
    const {onSelect, event, market = 0, eventResult} = props;

    if(event.type === 'GAMEEVENT'){
        return <GameEvent eventResult={eventResult} eventSelected={onSelect} event={event}/>
    } else if(event.type === 'RANKEVENT') {
        return <RankEvent eventResult={eventResult} onSelect={onSelect} event={event} market={market}/>
    }
}