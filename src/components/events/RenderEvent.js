import {Event} from "../SelectEvent";

export const RenderEvent = (props) => {
    const {onSelect, event} = props;

    if(event.type === 'GAMEEVENT'){
        return <Event eventSelected={onSelect} event={event}/>
    } else {
        return <div> {event.type} </div>
    }
}