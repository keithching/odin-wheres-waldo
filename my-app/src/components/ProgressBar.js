import { useState, useEffect } from 'react';

const ProgressBar = (props) => {
    const { characters } = props;
    const [ progress, setProgress ] = useState(0);

    // current progress is calculated by checking the status of the characters
    // update the progress as the characters props changed
    useEffect(() => {
        let counter = 0;
        let prog;

        characters.forEach(character => {
            if (character.status) {
                counter += 1;
            }
        });

        prog = counter / characters.length;

        setProgress(prog);

    }, [characters]);

    useEffect(() => {
        const totalPortions = characters.length;
        const currentPortions = progress * totalPortions;
        const progressBar = document.querySelector('.bar');

        if (currentPortions === 0) { // wipe out the portions inside progress bar
            while (progressBar.lastElementChild) {
                progressBar.removeChild(progressBar.lastElementChild);
            }
        }
        if (currentPortions !== 0) {
            incrementProgress();
        }
    }, [progress]); // only update if progress state updates

    function incrementProgress() {
        const totalPortions = characters.length;
        const progressBar = document.querySelector('.bar');
        const portion = document.createElement('div');
        portion.classList.add('portion');
        portion.style.width = progressBar.offsetWidth / totalPortions + 'px';
        progressBar.appendChild(portion);
    }

    return (
        <div className="progress-bar-container">
            <div>progress</div>
            <div className="progress-bar">
                <div className="bar"></div>
                <div>{`${Math.round(progress * 100)}%`}</div>
            </div>
        </div>
    );
};

export default ProgressBar;