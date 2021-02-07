import {AppCell} from '../../pages/NewWagerPage';
import styled from 'styled-components';
import Avatar from 'react-avatar';
import {useStoreActions, useStoreState} from 'easy-peasy';
import {useState, useEffect} from 'react';
import {ConfirmButton} from '../../styles';
import {SignUpButton} from '../../pages/SignUpPage';
import {UserAvatar} from '../UserAvatar';
import {useBreakpoint} from '../../hooks';

const PoolDescription = styled.div`

`

const SquaresContainer = styled.div`

`

const SquareGrid = styled.div`
  margin: auto;
  display: grid;
  grid-template-columns: repeat(11, minmax(1fr, 4vw));
  width: 100%;
`

const SquareCellContainer = styled.div`
  padding: 0.3rem;
  column-span: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;

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
    const width = useBreakpoint();

    const onClick = () => {

        if (!groupSelections[num]) {
            onSelected(num);
        }
    }

    return (
        <SquareCellContainer selected={selected} onClick={onClick}>
            {selected
                ? <UserAvatar
                    size={width > 600 ? 30 : 15}
                    textSizeRatio={width > 600 ? 3 : 1.5}
                    user={profile}/>
                : groupSelections[num]
                    ? <UserAvatar round size={25} user={groupSelections[num]}/>
                    : '$5'}
        </SquareCellContainer>
    )
}

const GridContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const GridContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const TeamName = styled.div`
  font-size: 1.4em;
  font-weight: bold;
`

const HorizontalTeamName = styled(TeamName)`
  writing-mode: vertical-rl;
  text-orientation: upright;
`

const Squares = (props) => {
    const {selections, groupSelections, onSquareSelected, pool} = props;

    return (
        <GridContainerRow>
            <HorizontalTeamName> Cheifs</HorizontalTeamName>
            <GridContainerColumn>
                <TeamName> Bucs </TeamName>
                <SquareGrid>
                    <NumberCell x={1} y={1}/>
                    {[...Array(10).keys()].map(it => <NumberCell x={1} y={it + 2}> {pool.rowLabels?.[it] || '?'} </NumberCell>)}
                    {[...Array(10).keys()].map(it => <NumberCell x={it + 2} y={1}> {pool.colLabels?.[it] || '?'}  </NumberCell>)}
                    {[...Array(100).keys()].map(it => <SquareCell onSelected={onSquareSelected} num={it}
                                                                  groupSelections={groupSelections}
                                                                  selections={selections}/>)}
                </SquareGrid>
            </GridContainerColumn>
        </GridContainerRow>
    )
}

const SquaresHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const SelectedInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: end;
`

const SelectedActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: end;
`

const SquaresInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: end;
`

const SaveSquaresButton = styled(SignUpButton)`
  margin-left: 1em;
`

export const SquaresPool = (props) => {
    const {pool} = props;
    const auth = useStoreState(state => state.firebase.auth);
    const submitPoolEntry = useStoreActions(actions => actions.pools.submitPoolEntry);
    const [selections, setSelections] = useState([]);
    const groupSelections = Object.values(pool.members)
        .filter(it => it.info.uid !== auth.uid)
        .flatMap(it => it.selections.map(selection => [it.info, selection]))
        .reduce((acc, [a, b]) => ({[b]: a, ...acc}), {})

    useEffect(() => {
        setSelections(pool.members[auth.uid]?.selections ?? [])
    }, [pool])

    const onSquareSelected = async (square) => {
        if (selections.includes(square)) {
            setSelections(selections.filter(it => it !== square));
        } else if (selections.length < pool.maxSelections) {
            const newSelections = [...selections, square];
            setSelections(newSelections);
            try {
                await submitPoolEntry({poolId: pool.id, groupId: pool.groupId, selections: newSelections});
            } catch (e) {
                console.error(e);
            }
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

                <SelectedInfo>
                    Selected: {selections.length} / {pool.maxSelections} (${selections.length * 5})
                    <SelectedActions>
                        {selections.length > 0 &&
                        <SaveSquaresButton onClick={() => setSelections([]) && onSave()}> Clear </SaveSquaresButton>}
                    </SelectedActions>
                </SelectedInfo>
            </SquaresHeader>
            <Squares {...{onSquareSelected, selections, groupSelections, pool}}/>
            <SquaresInfo>
                <p>
                    You can pick up to 10 squares. When the game starts each column and row will randomly be assigned
                    a number 0-9. The final number of each teams score at the end of that quarter determines the winner.
                    In the event a winning square is not selected, that quarter's winnings are proportionally distributed
                    amongst the other winners. (e.g. via the same proportions as below).
                </p>
                <p>
                    Payouts for each quarter are:
                    <span> Q1: 15%</span>
                    <span> Q2: 30%</span>
                    <span> Q3: 15%</span>
                    <span> Q4: 40%</span>
                </p>
            </SquaresInfo>
        </AppCell>
    )
}