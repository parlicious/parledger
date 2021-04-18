import {Statuses} from './wagers';
const functions = require('firebase-functions');
const admin = require('firebase-admin');

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

}

module.exports = {

}