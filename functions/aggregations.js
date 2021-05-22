const {Statuses} = require('./wagers');
const _ = require('lodash');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const db = admin.firestore();

/**
 * For now, we just read all the wagers for a user and update the aggregates. Eventually,
 * if this gets too expensive we can just incrementally adjust those stats
 *
 * In general, we look at the status of the wager that has changed, and if it's
 *  - booked
 *  - resolutionProposed
 *  - paid
 *
 *  We update the stats for each user.
 */
const updateWagerMemberStats = async (wager) => {

}


/**
 * Given a group and a user, read all wagers for that user and update their stats. We are mainly
 * focused on the P/L for each user, but we also track the amount of money on the table, number
 * of bets, and whatever else I think to add.
 */

const updateUsersGroupStats = async (uid, groupId) => {
    const rootQuery = db.collection('groups')
        .doc(groupId)
        .collection('wagers')

    const proposedBy = getCollection(await rootQuery.where('proposedBy.uid', '==', uid).get())
    const proposedTo = getCollection(await rootQuery.where('proposedTo.uid', '==', uid).get())

    const allWagers = [...proposedTo, ...proposedBy];

    const earnings = allWagers.map(getWagerEarnings(uid));

    const btcPrices = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
    const btcPrice = btcPrices?.data?.bpi.USD.rate_float;
    const parseWithPrice = parseAmount(btcPrice)

    const stats = {
        pnl: _.sumBy(earnings, it => parseWithPrice(it.winnings)),
        averageWager: _.meanBy(earnings, it => parseWithPrice(it.winnings)),
        committedAmount: _.sumBy(earnings, it => parseWithPrice(it.committed)),
        lifetimeWagerAmount: _.sumBy(earnings, it => parseWithPrice(it.wagered)),
    }

    await db.collection('users').doc(uid).update({stats});
    await db.collection('groups').doc(groupId).collection('users').doc(uid).update({stats});
}

const parseAmount = btcPrice => amountStr => {
    let factor = 1;

    if (!amountStr) {
        return 0;
    }

    try {
        let unparsedAmount = amountStr.toString();
        if (unparsedAmount.toLowerCase().includes('btc')) {
            factor = btcPrice;
            unparsedAmount = amountStr.toLowerCase().split('btc')[0];
        }

        const floatAmount = parseFloat(unparsedAmount)

        if (!isNaN(floatAmount)) {
            const parsedAmount = floatAmount * factor;
            // console.log({unparsedAmount, parsedAmount, btcPrice});
            return parsedAmount;
            j
        }

        return 0;
    } catch (e) {
        console.error(e);
        return 0;
    }
}

const getWagerEarnings = (uid) => (wager) => {
    const proposedBy = uid === wager.proposedBy.uid
    const hasWinner = [Statuses.PAID, Statuses.PROPOSED].includes(wager.status);

    if(wager.status === Statuses.REJECTED){
        return {};
    }

    let statusBasedStats;
    if (hasWinner) {
        const userWon = uid === wager.winner.uid;
        if (proposedBy) {
            if (userWon) {
                statusBasedStats = {winnings: wager.details.toWin}
            } else {
                statusBasedStats = {winnings: -1 * wager.details.risk}
            }
        } else {
            if (userWon) {
                statusBasedStats = {winnings: wager.details.risk}
            } else {
                statusBasedStats = {winnings: -1 * wager.details.toWin}
            }
        }
    } else if (wager.status === Statuses.BOOKED) {
        if (proposedBy) {
            statusBasedStats = {committed: wager.details.risk}
        } else {
            statusBasedStats = {committed: wager.details.toWin}
        }
    } else {
        statusBasedStats = {};
    }

    return {
        ...statusBasedStats,
        wagered: proposedBy ? wager.details.risk : wager.details.toWin
    }
}

const getCollection = (query) => {
    const arr = [];
    query.forEach(it => arr.push({id: it.id, ...it.data()}))

    return arr;
}


const manuallyUpdateUserStats = async () => {
    const groups = getCollection(await db.collection('groups').get());
    const updateGroupPromises = groups.map(it => updateStatsForUsersOfGroup(it.id))
    await Promise.all(updateGroupPromises);
}

const updateStatsForUsersOfGroup = async (groupId) => {
    const users = getCollection(await db.collection('groups').doc(groupId).collection('users').get());
    const updateUserPromises = users.map(it => updateUsersGroupStats(it.id, groupId))

    await Promise.all(updateUserPromises);
}

module.exports = {
    manuallyUpdateUserStats,
}