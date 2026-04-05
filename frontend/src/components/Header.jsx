import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './Auth/AuthModal';

const Header = () => {
    const { t, i18n } = useTranslation();
    const { user, role, logout } = useContext(AuthContext);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    return (
        <>
            <header className="numisfera-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>
                        <Link to="/">Numisfera</Link>
                    </h1>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="language-switcher" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '20px' }}>
                            <button onClick={() => changeLanguage('en')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: i18n.language === 'en' ? 1 : 0.4, fontSize: '0.9rem', color: '#FFF', fontWeight: 'bold' }}>
                                🇺🇸 EN
                            </button>
                            <span style={{color: '#555'}}>|</span>
                            <button onClick={() => changeLanguage('es')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: i18n.language === 'es' ? 1 : 0.4, fontSize: '0.9rem', color: '#FFF', fontWeight: 'bold' }}>
                                🇲🇽 ES
                            </button>
                        </div>
                        <ul style={{ margin: 0 }}>
                            <li>
                                <Link to="/">{t('header.catalog')}</Link>
                            </li>
                            {user && (
                                <li>
                                    <Link to="/auctions">{t('header.myAuctions')}</Link>
                                </li>
                            )}
                            {role !== 'USER_SIMPLE' && role !== 'USER_ANONYMOUS' && (
                                <li>
                                    <Link to="/admin">{t('header.administration')}</Link>
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
                                        {t('header.logout')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="btn-add-coin"
                                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    {t('header.connectIdentity')}
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
