import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './Auth/AuthModal';

const Header = () => {
    const { user, role, logout } = useContext(AuthContext);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <header className="numisfera-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>
                        <Link to="/">Numisfera</Link>
                    </h1>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <ul style={{ margin: 0 }}>
                            <li>
                                <Link to="/">Catálogo</Link>
                            </li>
                            {user && (
                                <li>
                                    <Link to="/auctions">Mis Subastas</Link>
                                </li>
                            )}
                            {role !== 'USER_SIMPLE' && role !== 'USER_ANONYMOUS' && (
                                <li>
                                    <Link to="/admin">Administración</Link>
                                </li>
                            )}
                        </ul>

                        <div className="auth-profile">
                            {user ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ color: '#FFD700', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {user.email || (user.walletAddress && `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`)}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Salir
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn-add-coin"
                                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    Conectar Identidad
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </>
    );
};

export default Header;
