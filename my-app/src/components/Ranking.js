import { useState, useEffect } from 'react';

// firebase SDK
import { initializeApp } from "firebase/app";
import { 
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
    getDoc,
    deleteDoc,
    getDocs
} from 'firebase/firestore';

const Ranking = () => {

    // initialize firebase
    const firebaseApp = initializeApp({
        apiKey: "AIzaSyA0XmgPzsaL_hT7n48x1e17H4KNJ-kaf-I",
        authDomain: "where-s-waldo-a2589.firebaseapp.com",
        projectId: "where-s-waldo-a2589",
        storageBucket: "where-s-waldo-a2589.appspot.com",
        messagingSenderId: "395014757241",
        appId: "1:395014757241:web:cad2bb43a52af2eb146da8"
    });
    
    // get Firebase Database
    const db = getFirestore(firebaseApp);

    const [ rankings, setRankings ] = useState([]);

    const [ currentRanking, setCurrentRanking ] = useState({
        photoID: null,
        rank: null
    });

    let tmp = [];

    const [ photos, setPhotos ] = useState([]);

    useEffect(async () => {

        // get the photo collection
        let photoIDs = [];

        const querySnapshot = await getDocs(collection(db, 'photos'));
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                photoIDs.push(doc.id); // mutate the tmp array
            });
        } 
    
        // select a photo from all the photos
        // save that photo as the current selection
        // display the current selected photo to DOM 

        photoIDs.forEach(async (photoID) => {
            const docSnap = await getDoc(doc(db, 'photos', photoID));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPhotos(prev => {
                    return prev.concat({
                        title: data.title,
                        id: photoID
                    });
                });
                console.log('data got from database');
            } else {
                console.log('no such document...');
            }
        });

        // get the ranking collection
        const rankingQuery = query(collection(db, 'playerRanking'), orderBy('clearTime', 'asc'));

        onSnapshot(rankingQuery, function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                if (change.type === 'removed') {
                    // todo
                } else {
                    let entry = change.doc.data();

                    tmp = tmp.sort((prev, current) => prev.clearTime - current.clearTime)
                            .concat({
                                        id: change.doc.id,
                                        playerName: entry.playerName === '' || entry.playerName === null ? 'blank' : entry.playerName,
                                        clearTime: entry.clearTime,
                                        photoID: entry.forPhoto
                                    })


                    setRankings(tmp);
                }
            });
        });

        return () => setRankings([]);

    }, []);

    // default the current ranking to be on the first photo
    useEffect(() => {
        if (photos.length !== 0) {
            setCurrentRanking({
                photoID: photos[0].id,
                rank: rankings.filter(ranking => ranking.photoID === photos[0].id)
            });
        }
    }, [photos, rankings]);


    return (
        <div className="ranking-container">
            <div className="ranking-nav-bar">
                {photos.map(photo => {
                    return (
                        <div 
                            key={photo.id} 
                            className={currentRanking.photoID === photo.id ? "ranking-nav-item current" : "ranking-nav-item"}
                            onClick={() => setCurrentRanking({
                                    photoID: photo.id,
                                    rank: rankings.filter(ranking => ranking.photoID === photo.id)
                                })}
                        >
                            {photo.title}
                        </div>
                    );
                })}
            </div>

            <div className="ranking-table">
                <div className="ranking-row-title">
                    <div className="ranking-playerName-title">Player</div>
                    <div className="ranking-clearTime-title">Time</div>
                </div>
                {(currentRanking.rank || []).map(entry => {
                    return (
                        <div className="ranking-row" key={entry.id}>
                            <div className="ranking-playerName">
                                {currentRanking.rank.indexOf(entry) === 0 ? 
                                    <i style={{color: 'gold'}} className="fas fa-trophy"></i> : 
                                currentRanking.rank.indexOf(entry) === 1 ?
                                    <i style={{color: 'silver'}} className="fas fa-trophy"></i> : 
                                currentRanking.rank.indexOf(entry) === 2 ?
                                    <i style={{color: 'rgb(205, 127, 50)'}} className="fas fa-trophy"></i> : 
                                null}
                                {entry.playerName}
                            </div>
                            <div className="ranking-clearTime">{entry.clearTime}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Ranking;