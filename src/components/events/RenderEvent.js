import {RankEvent} from "./RankEvent";
import {GameEvent} from "./GameEvent";

export const RenderEvent = (props) => {
    const {onSelect, event} = props;

    if(event.type === 'GAMEEVENT'){
        return <GameEvent eventSelected={onSelect} event={event}/>
    } else if(event.type === 'RANKEVENT') {
        return <RankEvent onSelect={onSelect} event={event}/>
    }
}