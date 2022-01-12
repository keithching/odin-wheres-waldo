import { useState, useEffect, useRef } from 'react';

const Photo = (props) => {
    const { characters, setCharacters, photo, displayAlert } = props;
    
    const [ userSelection, setUserSelection ] = useState({
        name: null,
        counter: 0
    });

    // global: telling JS where to put the targeting box at
    // local: mouse position relative to the photo
    const initialTargetingBox = {
        globalX: null,
        globalY: null,
        localX: null,
        localY: null,
        validity: false,
        mode: 'click'
    };
    const [ targetingBox, setTargetingBox ] = useState(initialTargetingBox);

    const initialDropDown = {
        validity: false
    };
    const [ dropdown, setDropdown ] = useState(initialDropDown);

    const handleContainerClick = (e) => {
        const gamePhotoDiv = document.querySelector('.game-photo');
        const gamePhoto = gamePhotoDiv.querySelector('img');
        // Find mouse position relative to element
        // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
        const imageRect = gamePhoto.getBoundingClientRect(); 

        if (e.clientX > imageRect.right || e.clientX < imageRect.left || e.clientY < imageRect.top 
            || e.clientY > imageRect.bottom) { // clicked outside the photo
                setTargetingBox({
                    globalX: e.clientX,
                    globalY: e.clientY,
                    localX: e.clientX - imageRect.left,
                    localY: e.clientY - imageRect.top,
                    validity: false,
                    mode: 'click'
                });
                setDropdown(prevDropdown => {
                    return {
                        validity: false
                    };
                });
        } else { // clicked inside the photo
            // get and store the coordinates of the mouse position relative to the photo        
            if (targetingBox.mode === 'click') { // enter selection mode
                setTargetingBox({
                    globalX: e.clientX,
                    globalY: e.clientY,
                    localX: e.clientX - imageRect.left,
                    localY: e.clientY - imageRect.top,
                    validity: true,
                    mode: 'selection'
                });
                setDropdown(prevDropdown => {
                    return {
                        validity: true
                    };
                });
            } else if (targetingBox.mode === 'selection') { // back to click mode
                setTargetingBox(prevTargetingBox => {
                    return {
                        ...prevTargetingBox,
                        validity: false,
                        mode: 'click'
                    }
                });
                setDropdown(prevDropdown => {
                    return {
                        validity: false
                    };
                });
            }
        }
    };

    const mounted = useRef(false);
    useEffect(() => { // execute the code only after the new coordinate states are set
        // https://stackoverflow.com/questions/53255951/equivalent-to-componentdidupdate-using-react-hooks
        if (!mounted.current) {
            mounted.current = true;
        } else { 
            // execute this below block of code during update, except for initial mount
            // simulating componentDidUpdate 
            // https://www.geeksforgeeks.org/how-to-position-a-div-at-specific-coordinates/
            const targetingBoxDOM = document.getElementById('targeting-box') || createTargetingBoxDOM();

            if (!targetingBox.validity) {
                targetingBoxDOM.remove();
            } else {
                targetingBoxDOM.style.left = targetingBox.globalX + window.scrollX - 15 + 'px'; // account for the font size
                targetingBoxDOM.style.top = targetingBox.globalY + window.scrollY - 15 + 'px'; // account for the font size
            }

            const dropdownDOM = document.getElementById('dropdown') || createDropdownDOM();

            if (!dropdown.validity) {
                dropdownDOM.remove();
            } else {
                dropdownDOM.style.left = `${ targetingBox.globalX + window.scrollX + 10 }px`;
                dropdownDOM.style.top = `${ targetingBox.globalY + window.scrollY }px`;
            }
        }
    }, [targetingBox, dropdown]); 


    function createTargetingBoxDOM() {
        const div = document.createElement('i');
        div.id = 'targeting-box';
        div.classList.add('fas'); 
        div.classList.add('fa-crosshairs');
        div.style.position = 'absolute';
        div.style.left = targetingBox.globalX + window.scrollX - 15 + 'px';
        div.style.top = targetingBox.globalY + window.scrollY - 15 + 'px';
        document.querySelector('.photo-container').appendChild(div);

        return div;
    }

    function createDropdownDOM() {
        const div = document.createElement('div');
        div.id = 'dropdown';

        const message = document.createElement('div');
        // message.textContent = `Who's there?`;

        const unorderList = document.createElement('ul');
        unorderList.classList.add('dropdown-items');
        for (let i = 0; i < characters.length; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = characters[i].name;
            listItem.classList.add('dropdown-item');
            listItem.addEventListener('click', () => {
                setUserSelection(prev => {
                    return {
                        name: characters[i].name,
                        counter: prev + 1
                    };
                }); // set user selection
            });
            unorderList.appendChild(listItem);
        }
        div.appendChild(message);
        div.appendChild(unorderList);

        div.style.position = 'absolute';
        div.style.left = `${ targetingBox.globalX + window.scrollX + 10 }px`;
        div.style.top = `${ targetingBox.globalY + window.scrollY }px`;
        document.querySelector('.photo-container').appendChild(div);

        return div;
    }

    function showDevData() {
        if (document.querySelector('.development-only').style.visibility === 'hidden') {
            document.querySelector('.development-only').style.visibility = 'visible';
        } else {
            document.querySelector('.development-only').style.visibility = 'hidden';
        }
    }

    // validate the user click against the characters' hitboxes
    useEffect(async () => {
        if (userSelection.name !== null) {
            const dropdownItems = document.getElementsByClassName('dropdown-item');
            const dropdownItemsArray = Array.from(dropdownItems);
    
            let localX = targetingBox.localX;
            let localY = targetingBox.localY;
            let isWithin = false;
            let hit = '';
            let hitboxes = characters.map(character => character.hitbox);
            
            // check whether the point is within any of the stored rects
            for (let i = 0; i < hitboxes.length; i++) {
                if (hitboxes[i].width >= 0) { 
                    if (hitboxes[i].height >= 0) {
                        if (
                            localX >= hitboxes[i].startPoint.x && 
                            localY >= hitboxes[i].startPoint.y &&
                            localX <= hitboxes[i].startPoint.x + hitboxes[i].width &&
                            localY <= hitboxes[i].startPoint.y + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        }
                    } else {
                        if (
                            localX >= hitboxes[i].startPoint.x &&
                            localY <= hitboxes[i].startPoint.y && 
                            localX <= hitboxes[i].startPoint.x + hitboxes[i].width && 
                            localY >= hitboxes[i].startPoint.y + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        } 
                    }
                    } else { // -ve width
                    if (hitboxes[i].height >= 0) {
                        if (
                            localX <= hitboxes[i].startPoint.x && 
                            localY >= hitboxes[i].startPoint.y &&
                            localX >= hitboxes[i].startPoint.x + hitboxes[i].width &&
                            localY <= hitboxes[i].startPoint.y + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        }
                    } else {
                        if (
                            localX <= hitboxes[i].startPoint.x &&
                            localY <= hitboxes[i].startPoint.y && 
                            localX >= hitboxes[i].startPoint.x + hitboxes[i].width && 
                            localY >= hitboxes[i].startPoint.y + hitboxes[i].height
                        ) {
                            isWithin = true;
                            hit = i;
                        }
                    }
                }
            }
    
            if (isWithin) {
                // if the selected character has been identified already 
                if (characters.find(character => character.name === userSelection.name).status) {
                    displayAlert('character found already :D');
                }
                // if the user selected character also matches with the hitbox
                else if (userSelection.name === characters[hit].name) {
                    setCharacters(prevCharacters => {
                        let newCharacters = [...prevCharacters];
    
                        for (let i = 0; i < newCharacters.length; i++) {
                            if (i === hit) {
                                newCharacters[i].status = true;
                            }
                        }
    
                        return newCharacters;
                    });
                    // add styling to indicate which character got hit
                    document.getElementById(characters[hit].id).classList.add('getHit');
                    
                    displayAlert(`${userSelection.name} found!`);

                    // add a marker on the found character
                    showMarkerOnCharacter();
    
                } else {
                    displayAlert('missed!');
                }
            } else {
                displayAlert('missed!');
            }
        }
    }, [userSelection]); // execute this effect when user selection gets updated

    function showMarkerOnCharacter() {
        let characterFound = characters.find(character => character.name === userSelection.name);
        let hitbox = characterFound.hitbox;

        const photoDOM = document.getElementById(photo.id);
        const photoRect = photoDOM.getBoundingClientRect();

        let midPointX = photoRect.left + hitbox.startPoint.x + hitbox.width / 2 + window.scrollX;
        let midPointY = photoRect.top + hitbox.startPoint.y + hitbox.height / 2 + window.scrollY;

        let div = createMarker(midPointX, midPointY);
        document.querySelector('.game-container').appendChild(div);
    }

    function createMarker(x, y) {
        const div = document.createElement('div');
        div.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
        div.style.position = 'absolute';
        div.style.color = 'rgb(0,225,150)';
        div.style.left = x + 'px';
        div.style.top = y + 'px';

        return div;
    }

    return (
        <div className="photo-container" onClick={handleContainerClick}>
            <div className="game-photo">
                <img src={photo.src} id={photo.id} draggable={false}/>
            </div>
        </div>
    );
}

export default Photo;