import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import '../styles/DetailPage.css';

const DetailPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [coin, setCoin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCoinDetails = async () => {
            try {
                setLoading(true);
                const data = await apiService.getCoinById(id);
                setCoin(data);
                setError(null);
            } catch (err) {
                setError('No se pudo cargar la información de la moneda o no existe en el catálogo.');
            } finally {
                setLoading(false);
            }
        };

        fetchCoinDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="spinner"></div>
                <p>Analizando archivo numismático...</p>
            </div>
        );
    }

    if (error || !coin) {
        return (
            <div className="detail-error">
                <span className="error-icon">⚠️</span>
                <p>{error || 'Moneda no encontrada.'}</p>
                <Link to="/" className="back-link">Volver al Catálogo</Link>
            </div>
        );
    }

    return (
        <div className="detail-page slide-up">
            <div className="detail-back-nav">
                <Link to="/" className="back-btn">
                    <span>&larr;</span> Volver al Catálogo
                </Link>
            </div>

            <div className="detail-content">
                <div className="detail-image-section">
                    <img
                        src={coin.imageUrl || 'https://via.placeholder.com/400'}
                        alt={coin.name}
                        className="detail-main-image"
                    />
                </div>

                <div className="detail-info-section">
                    <div className="detail-header">
                        <h2>{coin.name}</h2>
                        <div className="detail-badges">
                            <span className="badge badge-year">{coin.year}</span>
                            <span className="badge badge-grade">{coin.grade}</span>
                        </div>
                    </div>

                    <p className="detail-country">{coin.country}</p>

                    <div className="detail-description">
                        <h3>Historia y Detalles</h3>
                        <p>{coin.description || 'No hay descripción histórica disponible para esta pieza.'}</p>
                    </div>

                    <div className="detail-specs">
                        <h3>Especificaciones Técnicas</h3>
                        <ul className="specs-list">
                            <li>
                                <span className="spec-label">Material</span>
                                <span className="spec-value">{coin.material}</span>
                            </li>
                            <li>
                                <span className="spec-label">Año de Emisión</span>
                                <span className="spec-value">{coin.year}</span>
                            </li>
                            <li>
                                <span className="spec-label">País de Origen</span>
                                <span className="spec-value">{coin.country}</span>
                            </li>
                            <li>
                                <span className="spec-label">Grado de Conservación</span>
                                <span className="spec-value">{coin.grade}</span>
                            </li>
                            {user && coin.owner && (
                                <li>
                                    <span className="spec-label">Dueño / Custodio</span>
                                    <span className="spec-value" style={{ color: '#FFD700', fontWeight: 'bold' }}>
                                        {coin.owner.walletAddress ? `${coin.owner.walletAddress.slice(0, 6)}...${coin.owner.walletAddress.slice(-4)}` : coin.owner.email}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPage;
