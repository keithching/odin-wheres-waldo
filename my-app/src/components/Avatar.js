import { useEffect } from 'react';

const Avatar = (props) => {    
    const { characters } = props;

    useEffect(() => {
        characters.forEach(character => {
            const avatar = document.getElementById(character.id);
            avatar.addEventListener('transitionend', () => {
                avatar.classList.remove('transition');
            });
        });
    });

    return (    
        <div className="avatar">
            {characters.map(character => {

                let reveal = {
                    backgroundImage: `url(${character.avatar})`
                };

                return (
                    <div 
                        key={character.id} 
                        className={character.status ? "avatar-icon transition" : "avatar-icon"}
                        id={character.id}
                        style={character.status ? reveal : undefined}
                    >
                        <p>{character.name}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default Avatar;