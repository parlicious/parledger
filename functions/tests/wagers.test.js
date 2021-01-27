require('dotenv').config({path: '../.env'});
const firebase_tools = require("firebase-tools");
const test = require('firebase-functions-test')({
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    projectId: process.env.REACT_APP_PROJECTID,
}, process.env.SERVICE_ACCOUNT_CREDS);
const myFunctions = require('../index');
const createWager = test.wrap(myFunctions.createWager);
const joinGroup = test.wrap(myFunctions.joinGroup);


const faker = require('faker');
const admin = require('firebase-admin');

const db = admin.firestore();

describe('Functions', () => {
    const testUser1 = {
        uid: faker.random.uuid(),
        displayName: faker.name.findName(),
        avatarUrl: faker.image.imageUrl(),
        email: faker.internet.email()
    }

    const testUser2 = {
        uid: faker.random.uuid(),
        displayName: faker.name.findName(),
        avatarUrl: faker.image.imageUrl(),
        email: faker.internet.email()
    }

    const testUser3 = {
        uid: faker.random.uuid(),
        displayName: faker.name.findName(),
        avatarUrl: faker.image.imageUrl(),
        email: faker.internet.email()
    }

    const testUsers = [
        testUser1,
        testUser2,
        testUser3
    ]

    const groupId = faker.random.alpha(10);
    const testGroup = {
        groupId: groupId,
        codes: [
            {
                expires: admin.firestore.Timestamp.fromMillis(Date.now() + 1000000),
                value:groupId+'-test'
            }
        ]
    }


    beforeAll(async () => {
        // Add some test users;
        await Promise.all(testUsers.map(it => db.collection('users').doc(it.uid).set(it)));
        await db.collection('groups').doc(testGroup.groupId).set(testGroup);

    })

    afterAll( async () => {
        await Promise.all(testUsers.map(it => db.collection('users').doc(it.uid).delete()));
        await firebase_tools.firestore
            .delete(`/groups/${testGroup.groupId}`, {
                project: process.env.REACT_APP_FIREBASE_PROJECT,
                recursive: true,
                yes: true,
                token: process.env.FIREBASE_TOKEN
            });
    })

    describe('Groups', () => {
        it('can add members to a group', async () => {
            await expect(joinGroup({joinCode: testGroup.codes[0].value, uid: testUser1.uid}))
                .resolves
                .toBeUndefined()

            await expect(joinGroup({joinCode: testGroup.codes[0].value, uid: testUser2.uid}))
                .resolves
                .toBeUndefined()
        })

        it(`can't add member to a group they're already in`, async () => {
            await expect(joinGroup({joinCode: testGroup.codes[0].value, uid: testUser3.uid}))
                .resolves
                .toBeUndefined()

            await expect(joinGroup({joinCode: testGroup.codes[0].value, uid: testUser3.uid}))
                .rejects
                .toThrow('You\'re already in this group')
        })
    });
    describe('Wagers', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        describe('Create', () => {

            let createRequest;
            let context;

            beforeEach(() => {
                createRequest = {
                    groupId: 'testGroupId',
                    proposedTo: 'billsUid',
                    details: {},
                    type: 'CUSTOM',
                    isOpen: false
                };

                context = {
                    auth: {
                        uid: 'testUid'
                    }
                }
            })

            it(`can't create a wager for a non-existent user`, async () => {
                await expect(createWager(createRequest, context))
                    .rejects
                    .toThrow('You must be a member of the group to create wagers in it.');
            })
        })
    })
})
