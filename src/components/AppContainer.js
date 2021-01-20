import React, {useState, useEffect} from "react";
import {useStoreState} from "easy-peasy";
import {isEmpty, useFirebase} from "react-redux-firebase";
import {Link, useHistory, useLocation} from 'react-router-dom';
import styled, {css} from 'styled-components';
import {useBreakpoint} from "../hooks";

const AppHeader = styled.div`
  padding: 0.5em;
  min-height: 3em;
  display: flex;
  flex-direction: ${props => props.condensed ? 'column': 'row'};
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, #FFFFFF00, #FFFFFF09);
  border-bottom: 1px solid #FFFFFF2F;
`

const condensedCss = css`
  display: flex;
  flex-direction: column;

`

const ExpandedMenu = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: end;
`

const CondensedHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  width: 100%;
`

const LoggedInMenu = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;

  ${props => props.condensed ? condensedCss : ''};
`
const headerLinkStyles = css`
  margin: 0.4em;
  padding-bottom: 0.1em;

  :hover {
    border-bottom: 0.1em white solid;
  }
`
const AppHeaderLink = styled(Link)`
  ${headerLinkStyles};
`

const AppHeaderAnchor = styled.a`
  ${headerLinkStyles};
`

const AppBody = styled.div`
  padding: 1em;

  @media (max-width: 450px) {
    padding: 0;
  }
`

const ExpandMenu = styled.div`
  padding: 0.4em;
  font-size: 1.4em;
`

export const AppContainer = (props) => {
    const auth = useStoreState(state => state.firebase.auth);
    const profile = useStoreState(state => state.firebase.profile);
    const { pathname } = useLocation();
    const firebase = useFirebase();
    const history = useHistory();
    const width = useBreakpoint();
    const [menuOpened, setMenuOpened] = useState(false);
    const condensed = width < 450;

    const logOut = async () => {
        await firebase.logout();
        history.push('/')
    }

    useEffect(() => {
        setMenuOpened(false);
    }, [pathname])

    const menuItems = <React.Fragment>
        {isEmpty(auth)
            ? <AppHeaderLink to={'/login'}> Log In </AppHeaderLink>
            : <React.Fragment>
                <AppHeaderLink to="/home">
                    Home
                </AppHeaderLink>
                <AppHeaderLink to="/wagers/market">
                    Marketplace
                </AppHeaderLink>
                <AppHeaderLink to="/wagers/mine">
                    Me
                </AppHeaderLink>
                <AppHeaderLink to="/wagers/new">
                    Make a Wager
                </AppHeaderLink>
                <AppHeaderAnchor onClick={logOut}> Sign Out </AppHeaderAnchor>
            </React.Fragment>
        }
    </React.Fragment>


    if (condensed) {
        return (<React.Fragment>
            <AppHeader condensed>
                <CondensedHeaderRow>
                    <h3>
                        <Link to={isEmpty(auth) ? '/' : '/home'}>
                            ledger.bet
                        </Link>
                    </h3>
                    <ExpandMenu onClick={() => setMenuOpened(!menuOpened)}> <i className="fas fa-bars"/></ExpandMenu>
                </CondensedHeaderRow>
                {menuOpened && <ExpandedMenu>
                    {menuItems}
                </ExpandedMenu>}
            </AppHeader>
            <AppBody>
                {props.children}
            </AppBody>
        </React.Fragment>)
    } else {

        return (<React.Fragment>
            <AppHeader>
                <h3>
                    <Link to={isEmpty(auth) ? '/' : '/home'}>
                        ledger.bet
                    </Link>
                </h3>
                <LoggedInMenu>
                    {menuItems}
                </LoggedInMenu>
            </AppHeader>
            <AppBody>
                {props.children}
            </AppBody>
        </React.Fragment>)
    }
}
