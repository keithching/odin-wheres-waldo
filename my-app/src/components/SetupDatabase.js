import { useState, useEffect } from 'react';

// libraries
import uniqid from 'uniqid';
import _ from 'lodash';

// react components
import Avatar from './Avatar';
import Timer from './Timer';
import ProgressBar from './ProgressBar';

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

// initial database data
import getInitialDatabaseData from '../databaseInit';

const SetupDatabase = () => {
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

    const [ photos, setPhotos ] = useState([]);

    // for edit purpose
    const [ currentPhoto, setCurrentPhoto ] = useState({
        src: null,
        id: null
    });
    const [ currentCharacters, setCurrentCharacters ] = useState([]);
    const [ characterToEdit, setCharacterToEdit ] = useState(null);
    const [ mode, setMode ] = useState('setupMode');

    // get data from database
    useEffect(async () => {
        let photoIDs = [];

        const querySnapshot = await getDocs(collection(db, 'photos'));
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                photoIDs.push(doc.id); // mutate the tmp array
            });
        } 

        photoIDs.forEach(async (photoID) => {
            const docSnap = await getDoc(doc(db, 'photos', photoID));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPhotos(prev => {
                    return prev.concat({
                        title: data.title,
                        src: data.url,
                        id: photoID, 
                        characters: data.characters
                    });
                });
                console.log('characters, photo got from database');
            } else {
                console.log('no such document...');
            }
        });
    }, []);

    useEffect(() => {
        if (mode === 'setupMode') {
            document.getElementById('setupMode').classList.add('activeMode');
            document.getElementById('testMode').classList.remove('activeMode');
        } else if (mode === 'testMode') {
            document.getElementById('setupMode').classList.remove('activeMode');
            document.getElementById('testMode').classList.add('activeMode');
        }
    });

    const [ rects, setRects ] = useState([]); // limiting one rect for each character

    const [ rect, setRect ] = useState({
        isDrawing: false,
        startPoint: {
            x: null,
            y: null
        },
        endPoint: {
            x: null,
            y: null
        },
        width: null,
        height: null,
        id: uniqid(),
        forCharacter: null
    });

    useEffect(() => {
        setRect(prev => {
            return {
                ...prev,
                forCharacter: characterToEdit
            };
        });
    }, [characterToEdit]);


    // preview rectangle implementation 
    useEffect(() => {
        const photo = document.getElementById('photo-setup-mode');
        const photoRect = photo.getBoundingClientRect();
    
        if (mode === 'setupMode') {
          photo.addEventListener('click', drawRectStart);
          photo.addEventListener('mousemove', drawRectIng);
          photo.addEventListener('click', drawRectEnd);
        }
    
        function drawRectStart(e) {
            if (!characterToEdit) {
                console.log('pls select character first');
            } else {
                if (!rect.isDrawing) {
                    let isRepeat = false;

                    rects.forEach(storedRect => {
                        if (storedRect.forCharacter.name === characterToEdit.name) {
                            console.log(`this character's react has been set already`);
                            isRepeat = true;
                        }
                    });
                    
                    if (!isRepeat) {
                        setRect(prev => {
                            let newX = e.clientX - photoRect.left;
                            let newY = e.clientY - photoRect.top;
        
                            return {
                                ...prev,
                                startPoint: {
                                    x: newX,
                                    y: newY
                                },
                                isDrawing: true,
                                forCharacter: characterToEdit,
                            };
                        });
                    }
                }
            }
        }

        function drawRectIng(e) {
            if (!characterToEdit) {
                console.log('pls select character first');
            } else {
                if (rect.isDrawing) {
                    setRect(prev => {
                        let endX = e.clientX - photoRect.left;
                        let endY = e.clientY - photoRect.top;

                        return {
                            ...prev,
                            endPoint: {
                                x: endX,
                                y: endY
                            },
                            width: endX - prev.startPoint.x,
                            height: endY - prev.startPoint.y
                        };
                    });
                }
            }
        }

        function drawRectEnd() {
            if (!characterToEdit) {
                console.log('pls select character first');
            } else {
                if (rect.isDrawing) {  
                    // push into rects
                    setRects(rects.concat(rect));
        
                    const div = createRectDOM(
                        rect.startPoint.x, 
                        rect.startPoint.y, 
                        rect.width, 
                        rect.height, 
                        rect.forCharacter.name
                    );
                    const container = document.querySelector('.setup-container-content');
                    container.appendChild(div);

                    setRect(prev => {
                        return {
                            isDrawing: false,
                            startPoint: {
                                x: null,
                                y: null
                            },
                            endPoint: {
                                x: null,
                                y: null
                            },
                            width: null,
                            height: null,
                            id: uniqid(),
                            forCharacter: null
                        };
                    });

                    document.getElementById('rect').remove();
                }   
            }
        }

        return () => {
            photo.removeEventListener('click', drawRectStart);
            photo.removeEventListener('mousemove', drawRectIng);
            photo.removeEventListener('click', drawRectEnd);
        }
    });

    useEffect(() => {
        if (rect.isDrawing) {
            const photo = document.getElementById('photo-setup-mode');
            const photoRect = photo.getBoundingClientRect();

            let div = document.getElementById('rect');

            if (!div) {
                div = document.createElement('div');
                div.id = 'rect';
                let container = document.querySelector('.setup-container');
                container.appendChild(div);
            }

            if (rect.width === null && rect.height === null) {
                div.style.width = 0;
                div.style.height = 0;
            }

            div.style.position = 'absolute';
            div.textContent = rect.forCharacter.name;
            if (rect.width >= 0 && rect.height >= 0) {
                div.style.left = photoRect.left + rect.startPoint.x + window.scrollX + 'px';
                div.style.top = photoRect.top + rect.startPoint.y + window.scrollY + 'px';
                div.style.width = rect.width + 'px';
                div.style.height = rect.height + 'px';
            } else if (rect.width < 0 && rect.height >= 0) {
                div.style.left = photoRect.left + rect.endPoint.x + window.scrollX + 'px';
                div.style.top = photoRect.top + rect.startPoint.y + window.scrollY + 'px';
                div.style.width = -rect.width + 'px';
                div.style.height = rect.height + 'px';
            } else if (rect.width >= 0 && rect.height < 0) {
                div.style.left = photoRect.left + rect.startPoint.x + window.scrollX + 'px';
                div.style.top = photoRect.top + rect.endPoint.y + window.scrollY + 'px';
                div.style.width = rect.width + 'px';
                div.style.height = -rect.height + 'px';
            } else { // disable this option due to mousepointer at the rect itself: problem at identifying the second click
                // do nth
            }

            
        }
    }, [rect]);


    // returns a rect div element
    function createRectDOM(startX, startY, width, height, name) {
        let photo = document.getElementById('photo-setup-mode');
        let photoRect = photo.getBoundingClientRect();

        const div = document.createElement('div');
        div.classList.add('rect-setup-mode');
        div.style.position = 'absolute';
        div.style.left = startX + window.scrollX + photoRect.left + 'px';
        div.style.top = startY + window.scrollY + photoRect.top + 'px';
        div.style.width = width + 'px';
        div.style.height = height + 'px';
        div.textContent = name;
        
        return div;
    }

    // current character to edit
    useEffect(() => {
        if (mode === 'setupMode') {
            currentCharacters.forEach(character => {
                const div = document.getElementById(`${character.id}-setup`);
    
                if (character === characterToEdit) {
                    div.classList.add('characterToEdit');
                    setCharacterToEdit(character);
                } else {
                    div.classList.remove('characterToEdit');
                }
            });
        }
    });

    // clear DOM rects, stored rects, rect
    const clearRects = () => {
        const rectsDOM = document.getElementsByClassName('rect-setup-mode');
        const rectsDOMArray = Array.from(rectsDOM);
        rectsDOMArray.forEach(rectDOM => {
            rectDOM.remove();
        });

        setRects([]);

        setRect({
            isDrawing: false,
            startPoint: {
                x: null,
                y: null
            },
            endPoint: {
                x: null,
                y: null
            },
            width: null,
            height: null,
            id: uniqid(),
            forCharacter: characterToEdit
        });
    };
    
    async function pushToDatabase() {
        if (!characterToEdit) {
            alert('please select a character first');
        } else {
            const photoFromDB = doc(db, 'photos', currentPhoto.id);
            const docSnap = await getDoc(photoFromDB);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const charactersFromDB = data.characters;

                const updatedCharacters = charactersFromDB.map(characterFromDB => {
                    return {
                        avatar: characterFromDB.avatar,
                        hitbox: _.pick(rects.find(rect => rect.forCharacter.name === characterFromDB.name) || characterFromDB.hitbox || {},
                                    ['startPoint', 'width', 'height']), // lodash for returning a subset of properties
                        id: characterFromDB.id,
                        name: characterFromDB.name,
                        status: characterFromDB.status
                    };
                });

                // assign to hitbox
                await updateDoc(photoFromDB, {
                    characters: updatedCharacters
                });
                console.log('pushed to DB');

            } else {
                console.log("no such doc");
            }
        }
    }


    let isShowingDBHitbox = false;

    const showHitboxFromDatabase = async () => {

        if (!isShowingDBHitbox) {
            const photoFromDB = doc(db, 'photos', currentPhoto.id);
            const docSnap = await getDoc(photoFromDB);
    
            if (docSnap.exists()) {
                const data = docSnap.data();
                const charactersFromDB = data.characters;

                charactersFromDB.forEach(characterFromDB => {
                    if (!_.isEmpty(characterFromDB.hitbox)) {
                        let startX = characterFromDB.hitbox.startPoint.x;
                        let startY = characterFromDB.hitbox.startPoint.y;
                        let width = characterFromDB.hitbox.width;
                        let height = characterFromDB.hitbox.height;
                        let name = characterFromDB.name;
    
                        const div = createRectDOM(startX, startY, width, height, name);
                        let container = document.querySelector('.setup-container');
                        container.appendChild(div);
                    }
                });
            
                // use a different color when it is called from the database
                const rectsDOM = document.getElementsByClassName('rect-setup-mode');
                const rectsDOMArray = Array.from(rectsDOM);
                rectsDOMArray.forEach(rectDOM => {
                    rectDOM.classList.add('displayRectsFromDB');
                });

            } else {
                console.log('no such doc');
            }
    
            isShowingDBHitbox = true;
        } else {
            console.log('currently showing hitboxes');
        }
    };

    // test mode
    useEffect(() => {
        const photoDOM = document.getElementById('photo-setup-mode');
        const rect = photoDOM.getBoundingClientRect();
        
        if (mode === 'testMode') {
            photoDOM.addEventListener('click', validatePoint);
        }

        async function validatePoint(e) {
            let localX = e.clientX - rect.left;
            let localY = e.clientY - rect.top
            let isWithin = false;
            let hit = '';
            let hitboxes = currentCharacters.map(character => character.hitbox);
            
            // check whether the point is within any of the stored rects
            for (let i = 0; i < hitboxes.length; i++) {
                if (hitboxes[i].width >= 0) { 
                    if (hitboxes[i].height >= 0) {
                        if (
                            localX >= hitboxes[i].startPoint[0] && 
                            localY >= hitboxes[i].startPoint[1] &&
                            localX <= hitboxes[i].startPoint[0] + hitboxes[i].width &&
                            localY <= hitboxes[i].startPoint[1] + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        }
                    } else {
                        if (
                            localX >= hitboxes[i].startPoint[0] &&
                            localY <= hitboxes[i].startPoint[1] && 
                            localX <= hitboxes[i].startPoint[0] + hitboxes[i].width && 
                            localY >= hitboxes[i].startPoint[1] + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        } 
                    }
                    } else { // -ve width
                    if (hitboxes[i].height >= 0) {
                        if (
                            localX <= hitboxes[i].startPoint[0] && 
                            localY >= hitboxes[i].startPoint[1] &&
                            localX >= hitboxes[i].startPoint[0] + hitboxes[i].width &&
                            localY <= hitboxes[i].startPoint[1] + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        }
                    } else {
                        if (
                            localX <= hitboxes[i].startPoint[0] &&
                            localY <= hitboxes[i].startPoint[1] && 
                            localX >= hitboxes[i].startPoint[0] + hitboxes[i].width && 
                            localY >= hitboxes[i].startPoint[1] + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        }
                    }
                }
            }

            if (isWithin) {                
                // add styling to indicate which character got hit
                setCurrentCharacters(prevCharacters => {
                    let newCharacters = [...prevCharacters];

                    for (let i = 0; i < newCharacters.length; i++) {
                        if (i === hit) {
                            newCharacters[i].status = true;
                        }
                    }

                    return newCharacters;
                });

                document.getElementById(currentCharacters[hit].id).classList.add('getHit');
            } else {
                console.log('missed hit');
            }
        }

        return () => photoDOM.removeEventListener('click', validatePoint);

    });

    // listen to whether all characters' status are true
    const [ gameStatus, setGameStatus ] = useState(false);

    useEffect(() => {
        if (currentCharacters.length !== 0) { // ensure it has been initialized
            let gameEnded = currentCharacters.every(character => character.status);

            if (gameEnded) {
                setGameStatus(true);
            }
        }
    }, [currentCharacters]);

    useEffect(() => {
        if (gameStatus) {
            alert('game ended, yay');
        }
    });


    // setup the database data
    // testing: push a collection to the database. And if that data already exists in the database, do nothing
    // simulating a initial setup before the App can work properly
    // so when user lands on the game page, the App shall search for that ID from the database, and pull the data to the user browser
    async function savePhoto(photo) {
        try {
            await addDoc(collection(db, 'photos'), {
                title: photo.title,
                url: photo.url,
                difficulty: photo.difficulty,
                characters: photo.characters
            });
            console.log('photo added!');
        }
        catch(error) {
            console.log('Error writing new photo to Firebase Database', error);
        }
    }

    // make a button to push data
    // make a div to display the database data to the DOM
    // if press again, the data shall not be pushed to database again
    const addPhotoToDatabase = () => {
        const photos = getInitialDatabaseData();
        photos.forEach(photo => {
            savePhoto(photo); // save to Firebase database
        });
    };

    // get the database data
    const queryFromDatabase = async () => {
        // Get all documents in a collection
        // https://firebase.google.com/docs/firestore/query-data/get-data
        const querySnapshot = await getDocs(collection(db, 'photos'));
        
        // check if something is returned by the query
        // https://stackoverflow.com/questions/54541821/check-if-cloud-firestore-query-returns-something
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
            });
        } else {
            console.log('no documents in database collection..:(');
        }
    };

    const deleteDocsFromDatabase = async () => {
        // get all available docs from database under the collection
        const querySnapshot = await getDocs(collection(db, 'photos'));
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (document) => {
                // https://firebase.google.com/docs/firestore/manage-data/delete-data
                try {
                    await deleteDoc(doc(db, 'photos', document.id)); 
                    console.log(`${document.id} deleted!`);
                }
                catch(error) {
                    console.log('something went wrong..', error);
                }
            });
        } else {
            console.log('no documents to delete.. :(');
        }

        const querySnapshot2 = await getDocs(collection(db, 'playerRanking'));
        
        if (!querySnapshot2.empty) {
            querySnapshot2.forEach(async (document) => {
                // https://firebase.google.com/docs/firestore/manage-data/delete-data
                try {
                    await deleteDoc(doc(db, 'playerRanking', document.id)); 
                    console.log(`${document.id} deleted!`);
                }
                catch(error) {
                    console.log('something went wrong..', error);
                }
            });
        } else {
            console.log('no documents to delete.. :(');
        }
    };


    // toggle the more dev data
    let isVisible = false;

    const showDevData = () => {
        const div = document.querySelector('.more-dev-data');

        if (!isVisible) {
            div.style.visibility = 'hidden';
            isVisible = true;
        } else {
            div.style.visibility = 'visible';
            isVisible = false;
        }
    };

    const pickPhotoFromPhotos = (e) => {
        const selectedIndex = e.target.options.selectedIndex;
        const photoID = e.target.options[selectedIndex].getAttribute('data-key');

        // get the photo properties from photos
        const thisPhoto = photos.find(photo => photo.id === photoID);
        setCurrentPhoto({
            src: thisPhoto.src,
            id: thisPhoto.id,
        });
        setCurrentCharacters(thisPhoto.characters);
    };

    return (
        <div className="setup-container">
            <div className="setup-container-content">
                
                <div style={{color: 'skyblue'}}>
                    <select 
                        className="setup-photo-list" 
                        onChange={pickPhotoFromPhotos}>
                        <option disabled={true}>select a photo to edit</option>
                    {photos.map(photo => {
                        return (
                            <option 
                                key={photo.id}
                                data-key={photo.id}
                                className="setup-photo-list-item"
                            >
                                {photo.title}
                            </option>
                        );
                    })}
                    </select>
                </div>

                <img src={currentPhoto.src} 
                    id="photo-setup-mode"
                    draggable={false}
                />
                
                { mode === 'testMode' ? 
                
                    <div className="test-mode-content">
                        <Avatar characters={currentCharacters}/>
                        <Timer gameStatus={gameStatus}/>
                        <ProgressBar characters={currentCharacters} />
                    </div>

                :

                    <div className="setup-mode-content">
                        <div>edit character:</div>
                        <div className="characters-setup-mode">
                            {currentCharacters.map(character => {
                                return (
                                    <div 
                                        key={character.id} 
                                        className="character-setup-mode" 
                                        onClick={() => setCharacterToEdit(character)}
                                        id={`${character.id}-setup`}
                                    >
                                        {character.name}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="setup-mode-content-buttons">
                            <button onClick={clearRects}>clear rects</button>
                            <button onClick={pushToDatabase}>push to Database</button>
                            <button onClick={showHitboxFromDatabase}>show hitbox from DB</button>
                        </div>
                        <div className="more-dev-data">
                            <div>selected character to edit: {characterToEdit ? characterToEdit.name : 'none'}</div>
                            <div>photo id: {currentPhoto.id}</div>
                            {/* <div>current turn: {rect.currentTurn}</div> */}
                            <div>stored rects:</div>
                            <div className="storedRects">
                                {rects.map(rect => {
                                return (
                                    <div key={rect.id} id={rect.id} className="storedRect">
                                    <div>rect {rects.indexOf(rect) +1}:</div>
                                    <div>start points: {Math.round(rect.startPoint.x)}, {Math.round(rect.startPoint.y)}</div>
                                    <div>width: {Math.round(rect.width)}</div>
                                    <div>height: {Math.round(rect.height)}</div>
                                    <div>for character: {rect.forCharacter.name}</div>
                                    </div>
                                );
                                })}
                            </div>
                        </div>

                    </div>

                }


            </div>   
            
            <div className="setup-container-control-panel">
                <div>CONTROL PANEL</div>
                <button id="setupMode" onClick={() => setMode('setupMode')}>setup mode</button>
                <button id="testMode" onClick={() => setMode('testMode')}>test mode</button>
                <div>testing interaction with the database</div>
                <button onClick={addPhotoToDatabase}>add photo</button>
                <button onClick={queryFromDatabase}>query database</button>
                <button onClick={deleteDocsFromDatabase}>delete docs</button>
                <div>more dev data</div>
                <button onClick={showDevData}>toggle</button>
            </div> 
        </div>
    );
};

export default SetupDatabase;