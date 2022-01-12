import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import uniqid from 'uniqid';
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
import Avatar from './Avatar';
import RankingWidget from './RankingWidget';

const Home = () => {
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

          // modified characters data 
          // set characters' statuses as true for the sake of preview in Avatar in this page only
          let modCharacters = data.characters;
          modCharacters.forEach(character => character.status = true);

          setPhotos(prev => {
              return prev.concat({
                  title: data.title,
                  src: data.url,
                  id: photoID, 
                  characters: modCharacters,
                  difficulty: data.difficulty,
                  hover: false
              });
          });
          console.log('got data from database');
      } else {
          console.log('no such document...');
      }
    });
  }, []);

  // const [ topRanks, setTopRanks ] = useState([]);

  const [ rankings, setRankings ] = useState([]);

  // read ranking data
  let tmp = [];
  useEffect(() => {
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


  const EnterGameIcon = (props) => {
    const { photoID } = props;

    const style = {
      position: 'absolute' // the icon is position at the center by css flexbox
    };

    const [ iconHover, setIconHover ] = useState(false);

    let navigate = useNavigate();

    return (
      <div 
        id="enterGameIcon" 
        style={style}
        className={ iconHover ? 'effect-start effect-end' : 'effect-start' }
        onMouseEnter={() => setIconHover(true)}
        onMouseLeave={() => setIconHover(false)}
        onClick={() => navigate(`/game/${photoID}`)}
      >
        <i className="fas fa-door-open"></i>
      </div>
    );
  };

  const Card = (props) => {

    const { photo } = props;

    const onHoverOverCard = (id) => {
      setPhotos(prev => {
        const newPhotos = [...prev];
        newPhotos.forEach(newPhoto => {
          if (newPhoto.id === id) {
            newPhoto.hover = true;
          }
        });
        return newPhotos;
      });
    };

    const onLeaveOverCard = () => {
      setPhotos(prev => {
        const newPhotos = [...prev];
        newPhotos.forEach(photo => photo.hover = false);
        return newPhotos;
      });
    };

    return (
      <div 
        className="card"
        onMouseEnter={() => onHoverOverCard(photo.id)}
        onMouseLeave={onLeaveOverCard}
        data-key={photo.id}
      >
        <div className="card-upper-portion">
          <div className="photo">
            <img 
              src={photo.src} 
              id={photo.id}
            />
            { photo.hover ? <EnterGameIcon photoID={photo.id} /> : null }
          </div>
        </div>

        <div className="card-lower-portion">
          <div className="always-show">
            <div className="title">
              {photo.title}
            </div>
            <div className="difficulty">
              {photo.difficulty === 1 ? 
                <div>
                  <i className="fas fa-star"></i>
                  <i className="far fa-star"></i>
                  <i className="far fa-star"></i> 
                </div>
                : photo.difficulty === 2 ? 
                <div>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="far fa-star"></i>
                </div>
                : photo.difficulty === 3 ?
                <div>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                : null
              }
            </div>
          </div>
          { photo.hover ? 
            <div className="hover-row">
              <Avatar characters={photo.characters} />
              <RankingWidget rankings={rankings} photoID={photo.id}/>
            </div>
        : null }
        </div>
      </div>
    );
  };

  const slider = (() => {
    const slideBackward = () => { 
 
      setPhotos(prevPhotos => {
        console.log(prevPhotos);
        let newPhotos = prevPhotos.slice(0, prevPhotos.length - 1)
        newPhotos.splice(0,0,prevPhotos[prevPhotos.length-1]);
        console.log(newPhotos);
        return newPhotos;
      });
    };
  
    const slideForward = () => { 
      setPhotos(prevPhotos => {
        let newPhotos = prevPhotos.slice(1, prevPhotos.length);
        newPhotos.push(prevPhotos[0]);
        return newPhotos;
      });

    };

    return {
      slideBackward,
      slideForward
    };
  })();

  return (
    <div className="home-container">
      <div className="home-container-content">
        <button 
          id="slider-backward"
          onClick={slider.slideBackward}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="home-card-container">
          {photos.map(photo => {
            return (
              <Card 
                photo={photo}
                key={photo.id}
              />
            );
          })}
        </div>
        <button 
          id="slider-forward"
          onClick={slider.slideForward}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="credit">
        <span>credits <a href="http://www.sakurazaka46.com" target="_blank">sakurazaka46.com</a></span>
      </div>
    </div>
  );
};

export default Home;
