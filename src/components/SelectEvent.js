import {useStoreActions, useStoreState} from "easy-peasy";
import React, {useEffect, useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {Redirect, useHistory} from 'react-router-dom';
import {SportSelect} from "./SportSelect";
import {TitleRow} from "./events/commonEventComponents";
import {RenderEvent} from "./events/RenderEvent";

const SportSection = ({section, eventSelected}) => {
    const comp = section.path.find(p => p.type === 'COMPETITION')?.description;
    const descriptionPrefix = comp ? comp + ' - ' : '';
    const fullDescription = descriptionPrefix + section.path[0].description;
    return (
        <div>
            <TitleRow name={fullDescription} expectedMarkets={section.expectedMarkets}/>
            {section.events.map(it => <RenderEvent onSelect={eventSelected} event={it}/>)}
        </div>
    )
}


export const SelectEvent = ({}) => {
    const events = useStoreState(state => state.wagers.filteredEvents);
    const [numSections, setNumSections] = useState(10);
    const renderedEvents = events?.slice(0, numSections) || [];
    const opponent = useStoreState(state => state.wagers.new.opponent);
    const fetchMoreData = () => setNumSections(numSections + 1)
    const setEvent = useStoreActions(actions => actions.wagers.new.setDetails);
    const history = useHistory();

    const updateEvents = useStoreActions(actions => actions.wagers.loadEvents);
    useEffect(() => {
        updateEvents().catch(console.error);
    }, [events]);


    const eventSelected = (event) => {
        setEvent(event);
        history.push('/wagers/new/confirm')
    }

    if (opponent === null) {
        return <Redirect to={'/wagers/new'}/>
    }

    return (
        <React.Fragment>
            <SportSelect/>
            <InfiniteScroll
                dataLength={renderedEvents.length}
                next={fetchMoreData}
                hasMore={renderedEvents?.length !== events?.length}
                loader={<h4>Loading...</h4>}
                endMessage={
                    <p style={{textAlign: "center"}}>
                        <b>Huh, that's it.</b>
                    </p>
                }
            >
                {renderedEvents.map(section => <SportSection key={section.id} eventSelected={eventSelected}
                                                             section={section}/>)}
            </InfiniteScroll>
        </React.Fragment>
    )
}