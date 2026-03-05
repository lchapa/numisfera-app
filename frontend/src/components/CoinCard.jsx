import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/CoinCard.css';

const CoinCard = ({ coin }) => {
    const { user } = useContext(AuthContext);

    return (
        <div className="coin-card group">
            <div className="coin-card-image-wrapper">
                <img
                    src={(coin.imageUrls && coin.imageUrls.length > 0) ? `http://localhost:8080${coin.imageUrls[0]}` : 'https://via.placeholder.com/150'}
                    alt={coin.name}
                    className="coin-card-image"
                />
                <div className="coin-card-overlay">
                    <Link to={`/coin/${coin.id}`} className="view-details-btn">
                        Ver Detalles
                    </Link>
                </div>
            </div>
            <div className="coin-card-content">
                <div className="coin-card-header">
                    <h3 className="coin-name">{coin.name}</h3>
                    <span className="coin-year">{coin.year}</span>
                </div>
                <p className="coin-country">{coin.country}</p>
                <div className="coin-card-footer">
                    <span className="coin-material">{coin.material}</span>
                    <span className="coin-grade">{coin.grade}</span>
                </div>
                {user && coin.owner && (
                    <div className="owner-badge" style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#FFD700', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem' }}>
                        👤 {coin.owner.walletAddress ? `${coin.owner.walletAddress.slice(0, 6)}...${coin.owner.walletAddress.slice(-4)}` : coin.owner.email}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoinCard;
