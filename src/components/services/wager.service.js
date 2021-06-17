export const getLedgerItems = (wager) => {
    const wonAmount = wager?.winner?.uid === wager.proposedBy.uid ? wager.details.risk : wager.details.toWin;

    const common = {
        lastUpdatedAt: new Date(wager.lastUpdatedAt?.seconds * 1000),
        wager: wager,
    }


    const by = {
        ...common,
        ...wager.proposedBy,
        id: `${wager.id}-${wager?.proposedBy?.uid}`,
        opponentName: wager?.proposedTo?.displayName ?? 'Anyone',
        amount: wonAmount ?? wager.details.risk,
        winner: wager.winner ? wager.winner.uid === wager.proposedBy.uid : null
    };

    if(!wager.proposedTo){
        return [by]
    } else {
        const to = {
            ...common,
            ...wager.proposedTo,
            id: `${wager.id}-${wager?.proposedTo?.uid}`,
            opponentName: wager?.proposedBy?.displayName,
            amount: wonAmount ?? wager.details.toWin,
            winner: wager.winner ? wager.winner.uid === wager.proposedTo.uid : null
        };

        return [to, by]
    }

}