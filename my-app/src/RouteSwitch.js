import { HashRouter, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Nav from './components/Nav';
import Game from './components/Game';
import Ranking from './components/Ranking';
import SetupDatabase from './components/SetupDatabase';

const RouteSwitch = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Nav /> }>
                    <Route index element={<Home />} />
                    <Route path="game/:photoID" element={<Game />} />
                    <Route path="ranking" element={<Ranking />} />
                    <Route path="setupdatabase" element={<SetupDatabase />} />
                </Route>
            </Routes>
        </HashRouter>
    );
};

export default RouteSwitch;