import {AppCell} from '../../pages/NewWagerPage';
import styled from 'styled-components';
import Avatar from 'react-avatar';
import {useStoreActions, useStoreState} from 'easy-peasy';
import {useState, useEffect} from 'react';
import {ConfirmButton} from '../../styles';
import {SignUpButton} from '../../pages/SignUpPage';

const PoolDescription = styled.div`

`

const SquaresContainer = styled.div`

`

const SquareGrid = styled.div`
  margin: auto;
  display: grid;
  grid-template-columns: repeat(11, 1fr);
`

const SquareCellContainer = styled.div`
  padding: 0.3rem;
  column-span: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;
  
  max-width: calc(800px / 13);

  :hover {
    cursor: pointer;
    background-color: #FFFFFF13;
  }
  
  ${props => props.selected ? 'border: 1px solid white' : ''};
  border-radius: 0.3em;
  margin: 0.2em;
`

const NumberCell = styled(SquareCellContainer)`
  grid-column: ${props => props.x};
  grid-row: ${props => props.y};
`

const SquareCell = (props) => {
    const {num, selections, groupSelections, onSelected} = props
    const x = props.num % 10;
    const y = Math.floor(props.num / 10);
    const profile = useStoreState(state => state.firebase.profile);
    const selected = selections.includes(num);

    return (
        <SquareCellContainer selected={selected} onClick={() => onSelected(props.num)}>
            {selected
                ? <Avatar round size={'30px'} name={profile.displayName}/>
                : groupSelections[num]
                    ? <Avatar round size={'30px'} name={groupSelections[num]}/>
                    : '$5'}
        </SquareCellContainer>
    )
}

const Squares = (props) =>
{
    const {selections, groupSelections, onSquareSelected} = props;

    return (
        <SquareGrid>
            <NumberCell x={1} y={1}/>
            {[...Array(10).keys()].map(it => <NumberCell x={1} y={it + 2}> ? </NumberCell>)}
            {[...Array(10).keys()].map(it => <NumberCell x={it + 2} y={1}> ? </NumberCell>)}
            {[...Array(100).keys()].map(it => <SquareCell onSelected={onSquareSelected} num={it}
                                                          groupSelections={groupSelections}
                                                          selections={selections}/>)}
        </SquareGrid>
    )
}

const SquaresHeader = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
`

const SquaresInfo = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`

const SaveSquaresButton = styled(SignUpButton)`
margin-left: 1em;
`

export const SquaresPool = (props) =>
{
    const {pool} = props;
    const auth = useStoreState(state => state.firebase.auth);
    const submitPoolEntry = useStoreActions(actions => actions.pools.submitPoolEntry);
    const [selections, setSelections] = useState([]);
    const groupSelections = Object.values(pool.members)
        .filter(it => it.info.uid !== auth.uid)
        .flatMap(it => it.selections.map(selection => [it.info.displayName, selection]))
        .reduce((acc, [a, b]) => ({[b]: a, ...acc}), {})

    useEffect(() => {
        setSelections(pool.members[auth.uid]?.selections ?? [])
    }, [pool])

    const onSquareSelected = (square) => {
        if (selections.includes(square)) {
            setSelections(selections.filter(it => it !== square));
        } else if (selections.length < pool.maxSelections) {
            setSelections([...selections, square]);
        }
    }

    const onSave = async () => {
        try {
            await submitPoolEntry({poolId: pool.id, groupId: pool.groupId, selections});
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <AppCell>
            <SquaresHeader>
                <h2>
                    Super Bowl Squares
                </h2>

                <div>
                    Selected: {selections.length} / {pool.maxSelections} (${selections.length * 5})
                    {selections.length > 0 && <SaveSquaresButton onClick={onSave}> Save  </SaveSquaresButton>}
                    {selections.length > 0 && <SaveSquaresButton onClick={() => setSelections([]) && onSave()}> Clear </SaveSquaresButton>}
                </div>
            </SquaresHeader>
            <Squares {...{onSquareSelected, selections, groupSelections}}/>
            <SquaresInfo>
                <p>
                    Pick up to 10 squares, when the game starts each column and row will randomly be assigned one of
                    0-9.
                    If your Row / Column Combo is the score at the end of any quarter, you win that quarters payout.
                </p>
            </SquaresInfo>
        </AppCell>
    )
}