export const getLedgerItems = (wager) => {
    const wonAmount = wager?.winner?.uid === wager.proposedBy.uid ? wager.details.risk : wager.details.toWin;

    const common = {
        lastUpdatedAt: new Date(wager.lastUpdatedAt?.seconds * 1000),
        wager: wager,
    }


    const to = {
        ...common,
        ...wager.proposedTo,
        opponentName: wager.proposedBy.displayName,
        amount: wonAmount ?? wager.details.toWin,
        winner: wager.winner ? wager.winner.uid === wager.proposedTo.uid : null
    };

    const by = {
        ...common,
        ...wager.proposedBy,
        opponentName: wager.proposedTo.displayName,
        amount: wonAmount ?? wager.details.risk,
        winner: wager.winner ? wager.winner.uid === wager.proposedBy.uid : null
    };

    return [to, by]
}