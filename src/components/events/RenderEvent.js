import {RankEvent} from "./RankEvent";
import {GameEvent} from "./GameEvent";

export const RenderEvent = (props) => {
    const {onSelect, event, market = 0} = props;

    if(event.type === 'GAMEEVENT'){
        return <GameEvent eventSelected={onSelect} event={event}/>
    } else if(event.type === 'RANKEVENT') {
        return <RankEvent onSelect={onSelect} event={event} market={market}/>
    }
}