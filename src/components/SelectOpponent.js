import {useState, useEffect} from "react";
import algoliasearch from 'algoliasearch';
import {Hits, InstantSearch, SearchBox, connectStateResults} from 'react-instantsearch-dom';
import styled from 'styled-components';

// Include only the reset
import 'instantsearch.css/themes/reset.css';
// or include the full Algolia theme
import 'instantsearch.css/themes/algolia.css';
import Avatar from "react-avatar";


const searchClient = algoliasearch(
    'AT9T4ZSHO4',
    'e61e275ce3dea2bcb7f1a7249eb3bbcb'
);

const StyledHits = styled(Hits)`

  background: white;
  box-shadow: 3px 3px 25px #0000001C;
  margin-top: 0.5em;
  border-radius: 5px;

  ul {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    width: 100%;

    li {
      box-shadow: none;
      border: none;

      width: 100%;
      margin: 0;
      padding: 0.2em;
    }
  }
`

const HitContainer = styled.div`
  color: #0F2027;
  text-align: center;
  border: 1px solid white;
  padding: 0.3em;

  display: flex;
  justify-content: start;
  align-items: center;

  :hover {
    color: #0F2027AF;
    font-size: 1.05em;
    cursor: pointer;
  }
`

const HitContainerSpan = styled.span`
  padding-left: 1em;
  font-size: 1.17em;
`

const Hit = (opponentSelected) => ({hit}) => {
    return (
        <HitContainer onClick={() => opponentSelected(hit)}>
            <HitContainerSpan>{hit.avatarUrl
                ? <Avatar size={40} round={true} src={hit.avatarUrl}/>
                : <Avatar size={40} round={true} name={hit.displayName}/>
            }
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
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const StyledSearchBox = styled(SearchBox)`
  width: 100%;


  form {
    input {
      box-shadow: 3px 3px 25px #0000001C;
      font-size: 1.17em;
      padding: 1em 1.5em;
    }
  }
`

// const StateResults = ({ searchResults, setFirstResult }) => {
//     useEffect(() => {
//         setFirstResult(searchResults?.hits[0])
//     }, [searchResults])
//     return null;
// };

// const CustomStateResults = connectStateResults(StateResults);

export const SelectOpponent = ({opponentSelected}) => {
    const [showHits, setShowHits] = useState(false);
    const [firstResult, setFirstResult] = useState(null);
    return (
        <InstantSearch
            indexName="dev_users"
            onSearchStateChange={(searchState) => {
                console.log(searchState);
                setShowHits(true);
            }}
            searchClient={searchClient}
        >
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
                        translations={{placeholder: "Search for a user"}}
                        onChange={e => e.target.value.length === 0 && setShowHits(false)}
                        onReset={() => setShowHits(false)}
                    />
                </SearchRow>
                {showHits && <StyledHits hitComponent={Hit(opponentSelected)}/>}
                {/*<CustomStateResults setFirstResult={setFirstResult}/>*/}
            </SearchContainer>
        </InstantSearch>
    )
}