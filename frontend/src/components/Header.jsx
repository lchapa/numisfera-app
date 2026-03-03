import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="numisfera-header">
            <div className="container">
                <h1>
                    <Link to="/">Numisfera</Link>
                </h1>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Catálogo</Link>
                        </li>
                        <li>
                            <Link to="/admin">Administración</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
