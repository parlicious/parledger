require('dotenv').config({path: '../.env'});
const firebase_tools = require("firebase-tools");
const test = require('firebase-functions-test')({
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    projectId: process.env.REACT_APP_PROJECTID,
}, process.env.SERVICE_ACCOUNT_CREDS);
const myFunctions = require('../index');
const createWager = test.wrap(myFunctions.createWager);
const confirmWager = test.wrap(myFunctions.confirmWager);
const joinGroup = test.wrap(myFunctions.joinGroup);


const faker = require('faker');
const admin = require('firebase-admin');

const db = admin.firestore();


const getDoc = async (path, docId) => {
    const snapshot = await db.collection(path).doc(docId).get();

    return snapshot.data();
}

const getAllInCollection = async (path) => {
    const snapshot = await db.collection(path).get();
    const documents = [];

    snapshot.forEach(doc => documents.push(doc.data()));

    return documents;
}

const getCreatedWager = async (wager) => {
    const wagers = await getAllInCollection(`groups/${wager.groupId}/wagers`);
    return wagers.find(it => it.details.id === wager.details.id);
}

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

    const testUser4 = {
        uid: faker.random.uuid(),
        displayName: faker.name.findName(),
        avatarUrl: faker.image.imageUrl(),
        email: faker.internet.email()
    }

    const testUsers = [
        testUser1,
        testUser2,
        testUser3,
        testUser4
    ]

    const groupId = faker.random.alpha(10);
    const testGroup = {
        groupId: groupId,
        codes: [
            {
                expires: admin.firestore.Timestamp.fromMillis(Date.now() + 1000000),
                value: groupId + '-test'
            }
        ]
    }


    beforeAll(async () => {
        // Add some test users;
        await Promise.all(testUsers.map(it => db.collection('users').doc(it.uid).set(it)));
        await db.collection('groups').doc(testGroup.groupId).set(testGroup);

    })


    // Add some members to the group
    beforeAll(async () => {
        await expect(joinGroup({joinCode: testGroup.codes[0].value, uid: testUser1.uid}))
            .resolves
            .toBeUndefined()

        await expect(joinGroup({joinCode: testGroup.codes[0].value, uid: testUser2.uid}))
            .resolves
            .toBeUndefined()
    })

    afterAll(async () => {
        await Promise.all(testUsers.map(it => firebase_tools.firestore
            .delete(`/users/${it.uid}`, {
                project: process.env.REACT_APP_FIREBASE_PROJECT,
                recursive: true,
                yes: true,
                token: process.env.FIREBASE_TOKEN
            })));

        await firebase_tools.firestore
            .delete(`/groups/${testGroup.groupId}`, {
                project: process.env.REACT_APP_FIREBASE_PROJECT,
                recursive: true,
                yes: true,
                token: process.env.FIREBASE_TOKEN
            });
    })

    describe('Groups', () => {
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
        describe('Create', () => {

            let createRequest;
            let context;

            beforeEach(() => {
                createRequest = {
                    groupId: groupId,
                    proposedTo: testUser2.uid,
                    details: {},
                    type: 'CUSTOM',
                    isOpen: false
                };

                context = {
                    auth: {
                        uid: testUser1.uid
                    }
                }
            })

            describe('Errors', () => {
                it(`can't create a wager for a non-existent user`, async () => {
                    context.auth.uid = 'non-existent';
                    await expect(createWager(createRequest, context))
                        .rejects
                        .toThrow('You must be a member of the group to create wagers in it.');
                });

                it(`can't create a wager with someone who doesn't exist in the db`, async () => {
                    createRequest.proposedTo = faker.random.alpha(13);
                    await expect(createWager(createRequest, context))
                        .rejects
                        .toThrow('The other party of the wager isn\'t registered');
                })

                it(`can't create a wager with someone not in the group`, async () => {
                    createRequest.proposedTo = testUser4.uid;
                    await expect(createWager(createRequest, context))
                        .rejects
                        .toThrow('The other party of the wager isn\'t in this group');
                })

                it(`can't create a wager with yourself`, async () => {
                    createRequest.proposedTo = context.auth.uid
                    await expect(createWager(createRequest, context))
                        .rejects
                        .toThrow('You can\'t create a wager with yourself');
                })
            })

            describe('Head To Head', () => {

                it('can create a wager', async () => {
                    await expect(createWager(createRequest, context))
                        .resolves
                        .toBeDefined();
                })

                it(`wager is created in the group collection`, async () => {
                    createRequest.details.id = faker.random.uuid();
                    await createWager(createRequest, context);

                    const groupWagers = await getAllInCollection(`groups/${groupId}/wagers`);
                    expect(groupWagers.find(it => it.details.id === createRequest.details.id)).toBeDefined();
                })

                it(`wager is created in the proposing user's array`, async () => {
                    createRequest.details.id = faker.random.uuid();
                    await createWager(createRequest, context);

                    const proposingUser = await getDoc('users', context.auth.uid);
                    expect(Object.values(proposingUser.wagers).find(it => it.details.id === createRequest.details.id)).toBeDefined();

                    const proposedToUser = await getDoc('users', createRequest.proposedTo);
                    expect(Object.values(proposedToUser.wagers).find(it => it.details.id === createRequest.details.id)).toBeDefined();
                })


                it(`wager has a pending status when created`, async () => {
                    await createWager(createRequest, context);
                    const createdWager = await getCreatedWager(createRequest);

                    expect(createdWager.status).toBe("pending");
                })
            })

            describe('Open', () => {
                it('can create an open wager', async () => {
                    createRequest.isOpen = true;
                    await expect(createWager(createRequest, context)).resolves.toBeDefined();
                })

                it('open wager has an open status', async () => {
                    createRequest.isOpen = true;
                    await createWager(createRequest, context);
                    const createdWager = await getCreatedWager(createRequest);
                    expect(createdWager.status).toBe('open');
                })
            })
        })
        describe('Confirm', () => {

            let createRequest;
            let confirmRequest;
            let context;

            beforeEach(() => {
                createRequest = {
                    groupId: groupId,
                    proposedTo: testUser2.uid,
                    details: {},
                    type: 'CUSTOM',
                    isOpen: false
                };

                context = {
                    auth: {
                        uid: testUser1.uid
                    }
                }

                confirmRequest = {
                    groupId: createRequest.groupId,
                    accept: true
                }
            })


            describe('Errors', () => {
                it('wager must exist to confirm it', async () => {
                    await expect(confirmWager({...confirmRequest, wagerId: faker.random.uuid()}, context))
                        .rejects.toThrow('This wager doesn\'t exist');
                })
            })

            describe('Head to Head', () => {
                it(`the user the wager was proposed to can confirm the wager`, async () => {
                    const id = await createWager(createRequest, context);

                    context.auth.uid = createRequest.proposedTo;
                    await expect(confirmWager({...confirmRequest, wagerId: id}, context)).resolves.toBeUndefined();
                })

                it(`anyone but the user proposed to can not confirm the wager`, async () => {
                    const id = await createWager(createRequest, context);
                    await expect(confirmWager({...confirmRequest, wagerId: id}, context))
                        .rejects.toThrow(`This user may not accept the wager`)
                })

                it(`accepted wagers have a booked status`, async () => {
                    const id = await createWager(createRequest, context);

                    context.auth.uid = createRequest.proposedTo;
                    await confirmWager({...confirmRequest, wagerId: id}, context)

                    const wager = await getDoc(`groups/${groupId}/wagers`, id);

                    expect(wager.status).toBe('booked');
                })

                it(`rejected wagers have a rejected status`, async () => {
                    const id = await createWager(createRequest, context);

                    context.auth.uid = createRequest.proposedTo;
                    confirmRequest.accept = false;
                    await confirmWager({...confirmRequest, wagerId: id}, context)

                    const wager = await getDoc(`groups/${groupId}/wagers`, id);

                    expect(wager.status).toBe('rejected');
                })
            })


            describe('Open', () => {
                it(`anyone can confirm the wager`, async () => {
                    createRequest.isOpen = true;
                    const id = await createWager(createRequest, context);

                    context.auth.uid = testUser3.uid;
                    await expect(confirmWager({...confirmRequest, wagerId: id}, context)).resolves.toBeUndefined();
                })

                it(`creating user can rescind the wager`, async () => {
                    createRequest.isOpen = true;
                    const id = await createWager(createRequest, context);

                    confirmRequest.accept = false;
                    await expect(confirmWager({...confirmRequest, wagerId: id}, context)).resolves.toBeUndefined();
                })

                it(`rescinded wagers have a rejected status`, async () => {
                    createRequest.isOpen = true;
                    const id = await createWager(createRequest, context);

                    confirmRequest.accept = false;
                    await confirmWager({...confirmRequest, wagerId: id}, context)

                    const wager = await getDoc(`groups/${groupId}/wagers`, id);

                    expect(wager.status).toBe('rejected');
                })
            })

        })
    })
})
