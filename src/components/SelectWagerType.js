import styled from 'styled-components'
import {AppCell} from "../pages/NewWagerPage";
import {useStoreActions} from "easy-peasy";
import {SignUpButton} from "../pages/SignUpPage";
import {useHistory} from 'react-router-dom';


const wagerTypeToDetailsRoute = {
    'BOVADA': '/wagers/new/sports',
    'CUSTOM': '/wagers/new/custom'
}

const WagerOptionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
`

const WagerTypeOption = styled(SignUpButton)`
  margin: 1em;
  width: 35vw;
  min-width: 150px;
`

const SelectWagerTypeContainer = styled(AppCell)`
    align-items: center;
`

export const SelectWagerType = ({}) => {
    const setType = useStoreActions(actions => actions.wagers.new.setType);
    const history = useHistory();

    const onTypeSelected = (type) => {
        setType(type);
        const route = wagerTypeToDetailsRoute[type];
        history.push(route);
    }

    return (
        <SelectWagerTypeContainer>
            <h2>
                What kind of wager?
            </h2>
            <WagerOptionsContainer>
                <WagerTypeOption onClick={() => onTypeSelected('BOVADA')}>
                    Sports
                </WagerTypeOption>
                <WagerTypeOption onClick={() => onTypeSelected('CUSTOM')}>
                    Custom
                </WagerTypeOption>
            </WagerOptionsContainer>
        </SelectWagerTypeContainer>
    )
}