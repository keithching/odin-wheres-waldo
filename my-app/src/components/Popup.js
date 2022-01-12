const Popup = (props) => {

    const { gameStatus, pushUserFormDataToDatabase, closePopup, showError } = props;

    const contentContainer = document.querySelector('.content-container');
    const contentRect = contentContainer.getBoundingClientRect();

    let style = {
        position: 'absolute',
        width: contentRect.width + 'px',
        height: contentRect.height + 'px',
        left: contentRect.left + window.scrollX + 'px',
        top: contentRect.top + window.scrollY + 'px',
        backgroundColor: 'rgba(0,0,0,0.5)'
    };


    return (
        <div>
            <div style={style} id="popup">
                <form id="userForm" noValidate={true}>
                    <div className="userForm-title">Congratulations! <i className="fas fa-glass-cheers"></i></div>
                    <div className="userForm-msg">game cleared in {gameStatus.clearTime} seconds.</div>
                    <div className="userForm-row">
                        <label htmlFor="userForm-input">Name</label>
                        <input 
                            id="userForm-input"
                            autoComplete="off"
                            required={true}
                            onChange={showError}
                        />
                        <span
                            className="error" 
                            aria-live="polite"
                        >
                        </span>
                    </div>
                    <div className="userForm-row">
                        <button 
                            className="userForm-button-cancel"
                            onClick={closePopup}
                        >
                            maybe next time
                        </button>
                        <button 
                            className="userForm-button-submit" 
                            type="submit"
                            onClick={pushUserFormDataToDatabase}
                        >
                            show it off!
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Popup;