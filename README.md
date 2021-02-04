# ledger.bet

ledger.bet is a react app (bootstrapped with create-react-app)
running on firebase. The backend is comprised of a few cloud functions.
Data is stored in firestore.


## Getting Started

The project is configured for two firebase projects (my dev and prod).
I'd recommend creating a separate firebase project for you dev environment.
Even though you can do most things with the local emulators, you'll still need
a project. These steps are basically from [here](https://firebase.google.com/docs/web/setup).

1. Make an account and log into the [firebase console](https://console.firebase.google.com).
2. create a project (`ledger.bet-dev-<yourname>` or something)
3. install the firebase tools locally 
    - `npm install -g firebase-tools`
4. initialize firebase (you may need to log in)
    - `firebase init`
5. set up a local environment file
    - we use `cmd-env` to build and run the app. There are a couple
    scripts for a local env that require your firebase config. Copy the
      `.env` file to `.env.local` and add the values from your firebase console.
6. start the emulators
    - `npm run emulators`
7. start the app
    - `npm run start:local`
    


### Local Considerations

If you're using the emulators, the `npm run emulators` command
will automatically load and export data into firestore each time. When
you exit the emulators, make sure you wait for a clean exit (e.g 
only one ctrl-c).

I'm not emulating auth locally, but when running locally the email
auth provider is used instead of the google one, so you can create
random test accounts easily. 
    

## Architecture

Tech stack is:

- javascript
- React as the UI framework
  - all hooks
- Redux + easy-peasy for the global store
- react-router-dom for routing
- styled-components for styling
- react-redux-firebase for hooking up firebase with redux
- react-hook-form for form validation
- firebase
    - firebase hosting for the frontend
    - firestore for data
    - firebase functions for api-like services
    - firebase auth for authentication
    - firebase storage for blob storage


## Data Model

Firestore, being NoSQL, requires some weirdness. We basically assume some
headaches on writes to make reads simple.

There are two top-level collections `users` and `groups`. Groups have
a `codes` array of valid join codes + a `users` collection.

Users are primarily identified by their `uid` from firebase auth. Users
have an array of `groups` they belong to. They also have a list of `wagers`.

Currently, there is no way to make a group. So you can either used the data
exported by the emulator or manually create one. 


## Testing

There are integration tests for the cloud functions, that
directly hit a dev account in firestore. 


## Types of Wagers


### Head to Head

All head to head wagers have a risk and toWin amount which represents the amount of risked by the proposedBy user 
and the

- Custom
  - Custom wagers are pretty simple just a description of the bet
- Bovada
  - a user selects an event from bovada which has all the description / date / odds / etc
    


### Pools

Pools are the generic term for multiway bets with members selecting some number of outcomes. Pools can be pretty flexible,
and for now they're mostly one-off type events.




