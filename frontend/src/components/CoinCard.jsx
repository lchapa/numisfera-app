import { Link } from 'react-router-dom';
import '../styles/CoinCard.css';

const CoinCard = ({ coin }) => {
    return (
        <div className="coin-card group">
            <div className="coin-card-image-wrapper">
                <img
                    src={coin.imageUrl || 'https://via.placeholder.com/150'}
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
            </div>
        </div>
    );
};

export default CoinCard;
