const RankingWidget = (props) => {
    
    const { rankings, photoID } = props;

    const currentRanking = rankings.filter(ranking => ranking.photoID === photoID).slice(0, 3); // extract the top three only for display

    return (
        <div>
            {currentRanking.map(ranking => {
                return (
                    <div key={ranking.id} className="topRank-row">
                        <div className="topRank-playerName">
                            {currentRanking.indexOf(ranking) === 0 ? 
                                <i style={{color: 'gold'}} className="fas fa-trophy"></i> : 
                            currentRanking.indexOf(ranking) === 1 ?
                                <i style={{color: 'silver'}} className="fas fa-trophy"></i> : 
                            currentRanking.indexOf(ranking) === 2 ?
                                <i style={{color: 'rgb(205, 127, 50)'}} className="fas fa-trophy"></i> : 
                            null}
                            {ranking.playerName}
                        </div>
                        <div className="topRank-clearTime">{ranking.clearTime}'</div>
                    </div>
                );
            })}
        </div>
    );
};

export default RankingWidget;