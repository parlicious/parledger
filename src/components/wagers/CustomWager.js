import {WagerDescription} from "./WagerDescription";
import {InlineWagerActions} from "./InlineWagerActions";
import styled from "styled-components";

const CustomWagerContainer = styled.div`
  background: linear-gradient(to bottom, #FFFFFF04, #FFFFFF09);
  box-shadow: 3px 3px 25px #0000001C;
  border-radius: 0.3em;
  max-width: 800px;
  margin: 1em auto;
`

const CustomWagerDetails = styled.div`
  padding: 1em;
`

export const CustomWager = (props) => {
    const {wager} = props;
    return (
        <CustomWagerContainer>
            <WagerDescription
                wager={wager}
                pending={wager.status === 'pending'}
                eventDescription={"Custom Wager"}
                risk={wager.details.risk}
                toWin={wager.details.toWin}
            />
            <CustomWagerDetails>
                {wager.details.description}
            </CustomWagerDetails>
            <InlineWagerActions {...props}/>
        </CustomWagerContainer>
    )
}