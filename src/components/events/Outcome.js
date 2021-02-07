import {AdjustedOdds, OddsContainer, OutcomeContainer} from "./commonEventComponents";
import {useStoreState} from 'easy-peasy';

function topOutcomesNotClose(outcomes, numberToCheck) {
    const decimalPrices = outcomes?.slice(0, numberToCheck)
        ?.map(outcome => outcome?.price?.decimal ?? '0')
        ?.map(n => Number(n));

    if (!decimalPrices || !decimalPrices.length) return false;

    const mean = decimalPrices.reduce((a, b) => a + b) / decimalPrices.length;

    const diffs = decimalPrices.map(price => Math.abs(price - mean));

    return diffs.every(diff => diff > .06);
}

export const Outcome = (props) => {
    const {outcomes} = props;
    const outcome = outcomes?.[props.outcome];
    const forcePrice = topOutcomesNotClose(outcomes, 2);
    const price = forcePrice ? <AdjustedOdds> {outcome.adjustedOdds ?? outcome.price.american} </AdjustedOdds> : ' ';
    const selectedProps = useStoreState(state => state.pools.selectedProps);
    const propSelected = Object.values(selectedProps).includes(outcome?.id);

    if (outcome) {
        return (
            <OutcomeContainer propSelected={propSelected}>
                {outcome.price.handicap
                    ? <OddsContainer>
                        {['O', 'U'].includes(outcome.type) && outcome.type}&nbsp;{outcome.price.handicap} {price}
                    </OddsContainer>
                    : <OddsContainer>
                        {outcome.price.american} {outcome.adjustedOdds ?
                        <AdjustedOdds> {outcome.adjustedOdds} </AdjustedOdds> : ''}
                    </OddsContainer>}
            </OutcomeContainer>
        )
    } else {
        return <span/>
    }
}