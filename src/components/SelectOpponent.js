import {useState} from "react";
import algoliasearch from 'algoliasearch';
import {Hits} from 'react-instantsearch-dom';
import styled from 'styled-components';

// Include only the reset
import 'instantsearch.css/themes/reset.css';
// or include the full Algolia theme
import 'instantsearch.css/themes/algolia.css';
import Avatar from "react-avatar";
import {useStoreState} from "easy-peasy";
import {useFirestoreConnect} from "react-redux-firebase";
import {AppCell} from "../pages/NewWagerPage";
import {UserAvatar} from "./UserAvatar";


const searchClient = algoliasearch(
    'AT9T4ZSHO4',
    'e61e275ce3dea2bcb7f1a7249eb3bbcb'
);

const HitsContainer = styled.div`

  //background: ${props => props.theme.interfaceColor};
  //box-shadow: 3px 3px 25px #0000001C;
  //margin-top: 0.5em;
  //border-radius: 0.3em;
`

const HitContainer = styled.div`
  color: #0F2027;
  text-align: center;
  padding: 0.3em;

  background: ${props => props.theme.interfaceColor};
  box-shadow: 3px 3px 25px #0000001C;
  margin-top: 0.5em;
  border-radius: 0.3em;

  display: flex;
  justify-content: start;
  align-items: center;

  :hover {
    background: #f2f2f2;
    cursor: pointer;
  }
`

const HitContainerSpan = styled.span`
  padding-left: 1em;
  font-size: 1.17em;
`

const Hit = ({hit, opponentSelected}) => {
    return (
        <HitContainer onClick={() => opponentSelected(hit)}>
            <HitContainerSpan>
                <UserAvatar user={hit}/>
            </HitContainerSpan>
            <HitContainerSpan>
                {hit.displayName}
            </HitContainerSpan>
        </HitContainer>
    )
}

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const SearchRow = styled.div`
  display: flex;
  flex-direction: column;
`

export const StyledSearchBox = styled.input`
  font-size: 1.17em;
  padding: 0.3em;
  box-shadow: 3px 3px 25px #0000001C;
  border: 0.3em;

  min-height: 40px;
  background: ${props => props.theme.interfaceColor};
  margin-top: 0.5em;
  border-radius: 0.3em;
`

const doFilter = (query) => (member) => {
    const name = member.displayName?.toLowerCase() ?? "";
    const email = member.email?.toLowerCase() ?? "";
    const normalizedQuery = query.toLowerCase();

    return name.includes(normalizedQuery) || email.includes(normalizedQuery);
}

export const SelectOpponent = ({opponentSelected}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const profile = useStoreState(state => state.firebase.profile);
    const auth = useStoreState(state => state.firebase.auth);
    useFirestoreConnect(profile.groups.map(group => ({collection: `groups/${group}/users`, storeAs: 'groupMembers'})));
    const members = useStoreState(state => state.firestore.data.groupMembers);
    const openWagerOptions = {
        displayName: <span> Allow anyone to accept&nbsp;it </span>,
        avatarUrl: '/user.png',
        uid: 'OPEN'
    }
    const filteredMembers = [...Object.values(members ?? {}).filter(it => it.uid !== auth.uid).filter(doFilter(searchQuery)), openWagerOptions]


    return (
        <AppCell>
            <SearchContainer>
                <SearchRow>
                    <h2>
                        Propose a bet to
                    </h2>

                    <StyledSearchBox
                        onSubmit={event => {
                            event.preventDefault();
                            console.log(event.currentTarget);
                        }}
                        placeholder="Search for a user"
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </SearchRow>
                <HitsContainer>
                    {filteredMembers?.map(member => <Hit key={member.uid} hit={member} opponentSelected={opponentSelected}/>)}
                </HitsContainer>
            </SearchContainer>
        </AppCell>
    )
}