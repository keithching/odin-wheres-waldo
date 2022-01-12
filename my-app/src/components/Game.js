import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Photo from './Photo';
import Timer from './Timer';
import Avatar from'./Avatar';
import ProgressBar from './ProgressBar';
import Popup from './Popup';
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

const Game = () => {
    // initialize firebase
    const firebaseApp = initializeApp({
        apiKey: "AIzaSyA0XmgPzsaL_hT7n48x1e17H4KNJ-kaf-I",
        authDomain: "where-s-waldo-a2589.firebaseapp.com",
        projectId: "where-s-waldo-a2589",
        storageBucket: "where-s-waldo-a2589.appspot.com",
        messagingSenderId: "395014757241",
        appId: "1:395014757241:web:cad2bb43a52af2eb146da8"
    });
  
    // get Firebase database
    const db = getFirestore(firebaseApp);

    // photo and characters
    const [ photo, setPhoto ] = useState({
        src: null,
        id: null
    });
    const [ characters, setCharacters] = useState([]);
    
    // listen to whether all characters' status are true
    const [ gameStatus, setGameStatus ] = useState({
        gameEnded: false,
        clearTime: null,
    });

    useEffect(() => {
        if (characters.length !== 0) { // ensure it has been initialized
            let gameEnded = characters.every(character => character.status);

            if (gameEnded) {
                setGameStatus(prev => {
                    return {
                        ...prev, 
                        gameEnded: true // change this property only
                    };
                });
            }
        }
    }, [characters]);


    // photo ID get from the URL
    let { photoID } = useParams();

    // get data from database
    useEffect(async () => {    
        const docSnap = await getDoc(doc(db, 'photos', photoID));

        if (docSnap.exists()) {
            const data = docSnap.data();
            const charactersData = data.characters;
            setCharacters(charactersData); 
            setPhoto({
                src: data.url,
                id: photoID
            });
            console.log('data got from database');
        } else {
            console.log('no such document...');
        }
    }, []);


    // push userform data to database player ranking collection
    async function pushUserFormDataToDatabase(e) {
        e.preventDefault(); // prevent form from submitting

        const userNameInput = document.getElementById('userForm-input');

        if (showError()) { // invalid input field
            userNameInput.classList.add('invalid');
            userNameInput.addEventListener('transitionend', () => userNameInput.classList.remove('invalid'));
        } else { 
            // add doc to the database
            try {
                await addDoc(collection(db, 'playerRanking'), {
                    forPhoto: photoID,
                    playerName: userNameInput.value,
                    clearTime: gameStatus.clearTime
                });

                closePopup();

                displayAlert('post to ranking!');

            }
            catch(error) {
                console.log('Error writing new player data to Firebase Database', error);

                displayAlert(`can't post to ranking.. sth wrong :s`);
            }
        }
    }

    const displayAlert = (msg) => {
        const alertDOM = document.createElement('div');
        alertDOM.id = 'alertMsg';
        alertDOM.textContent = msg;

        const gameContainer = document.querySelector('.game-container');
        gameContainer.appendChild(alertDOM);

        // is this practice OK?
        setTimeout(() => {
            alertDOM.classList.add('show');
        }, 0);

        setTimeout(() => {
            alertDOM.classList.remove('show');
        }, 1000);

        setTimeout(() => {
            document.getElementById('alertMsg').remove();
        }, 1500);
    };

    const showError = () => {
        const userNameInput = document.getElementById('userForm-input');
        const errorDiv = document.querySelector('#userForm-input + span.error');

        if (!userNameInput.validity.valid) {
            if (userNameInput.validity.valueMissing) {
                errorDiv.textContent = 'missing value...';
                return true;
            }
        } else {
            errorDiv.textContent = '';
            return false;
        }
    };

    const closePopup = () => {
        const popup = document.getElementById('popup');
        popup.remove();
    }

    return (
        <div className="game-container">
            <div className="utilities">
                <Timer 
                    gameStatus={gameStatus} 
                    setGameStatus={setGameStatus}
                    photo={photo}
                />
                <Avatar 
                    characters={characters}
                />
                <ProgressBar 
                    characters={characters}
                />
            </div>
            <Photo 
                characters={characters}
                setCharacters={setCharacters}
                photo={photo}
                displayAlert={displayAlert}
            />
            { gameStatus.gameEnded ? 
                <Popup 
                    gameStatus={gameStatus}
                    pushUserFormDataToDatabase={pushUserFormDataToDatabase}
                    closePopup={closePopup}
                    showError={showError}
                /> : null }
        </div>
    );
};

export default Game;