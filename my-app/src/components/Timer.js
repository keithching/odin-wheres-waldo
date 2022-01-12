import { useState, useEffect } from 'react';

const Timer = (props) => {

    const { gameStatus, setGameStatus, photo } = props;

    const [ time, setTime ] = useState(0);
    useEffect(() => {
        if (photo.src !== null) { // making sure photo is loaded 
            if (!gameStatus.gameEnded) {
                if (!pause) {
                    let incrementTime = setInterval(() => {
                        setTime(prevTime => prevTime + 1);
                    }, 1000);
            
                    return () => clearInterval(incrementTime);
                }
            }
        }
    }); // To be refactored to listen for photo getting loaded

    useEffect(() => {
        if (gameStatus.gameEnded && gameStatus.clearTime === null) {
            setGameStatus(prev => {
                return {
                    ...prev,
                    clearTime: time
                };
            });
        }
    });

    const [ pause, setPause ] = useState(false);
    const [ tmp, setTmp ] = useState(0);

    const pauseTimer = () => {
        if (!pause) {
            setPause(true);
            addMosaicToPhoto();
            setTmp(time);
        } else {
            setPause(false);
            removeMosaicFromPhoto();
        }
    };

    const addMosaicToPhoto = () => {
        const container = document.querySelector('.photo-container');
        const photoDiv = document.querySelector('.game-photo');
        const photoRect = photoDiv.getBoundingClientRect();

        const mosaic = document.createElement('div');
        mosaic.id = 'photo-mosaic';
        mosaic.style.position = 'absolute';
        mosaic.style.backgroundColor = 'rgba(255,255,255,0.5)';
        mosaic.style.backdropFilter = 'blur(10px)';
        mosaic.style.width = photoRect.width + 'px';
        mosaic.style.height = photoRect.height + 'px';
        mosaic.style.left = photoRect.left + window.scrollX + 'px';
        mosaic.style.top = photoRect.top + window.scollY + 'px';

        container.appendChild(mosaic);
    };

    const removeMosaicFromPhoto = () => {
        const mosaic = document.getElementById('photo-mosaic');
        mosaic.remove();
    };

    return (
        <div className="timer-container">
            {gameStatus.gameEnded ? 
                <div className="timer gameEnded">game ended in {time} seconds</div> : 
                <div className="timer">
                    {pause ? <i className="fas fa-hourglass-end"></i> : <i className="fas fa-hourglass-start"></i>}
                    <span>TIMER</span>
                    <span>{pause ? tmp : time}</span>
                    <button onClick={pauseTimer}>
                        {pause ? <i className="fas fa-play"></i> : 
                                <i className="fas fa-pause"></i>}
                    </button>
                </div>
            }
        </div>
    );
};

export default Timer;