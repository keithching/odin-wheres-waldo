import { Outlet, NavLink, Link } from 'react-router-dom';
import '../styles/style.css';

const Nav = () => {

    let activeClassName = "activePage";

    return (
        <div className="master-container">
            <div className="main-container">
                <div className="nav-container">
                    <div className="brand">
                        <div className="brand-icon">
                            <i className="fas fa-search"></i>
                        </div>
                        <div className="nav-links" id="brand-name">
                            <Link
                                to="/"
                            >
                                <span className="font-one">櫻坂</span> <span className="font-two">見る会</span>
                            </Link>
                        </div>
                    </div>
                    <div className="spacing"></div>
                    <div className="nav-links">
                        <NavLink
                            to="/"
                            className={({ isActive }) => 
                            isActive ? activeClassName : undefined
                            } 
                        >
                            Home
                        </NavLink>
                        <NavLink 
                            to="/ranking"
                            className={({ isActive }) => 
                            isActive ? activeClassName : undefined
                            }
                        >
                            Ranking
                        </NavLink>

                        {/* for developer only */}

                        {/* <NavLink
                            to="/setupdatabase"
                            className={({ isActive }) => 
                            isActive ? activeClassName : undefined
                            }
                        >
                            Setup Database
                        </NavLink> */}

                        {/* for developer only */}

                    </div>
                </div>
                <div className="content-container">
                    <Outlet />
                </div>
            </div>
            <div className="footer">
                <span>Copyright © 2022 <a href="https://github.com/keithching" target="_blank">keithching</a></span> 
            </div>
        </div>
    );
};

export default Nav;