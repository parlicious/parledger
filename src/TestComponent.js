import {useStoreActions, useStoreState} from "easy-peasy";
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";


export const TestComponent = () => {
    useFirestoreConnect([
        { collection: 'test' } // or 'test'
    ])
    const test = useStoreState((state) => state.firestore.ordered.test)

    console.log(test);

    return (
        <div> Sup !</div>
    )
}