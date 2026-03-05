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
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

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

    const images = coin.imageUrls && coin.imageUrls.length > 0
        ? coin.imageUrls.map(url => `http://localhost:8080${url}`)
        : ['https://via.placeholder.com/400'];

    return (
        <div className="detail-page slide-up">
            <div className="detail-back-nav">
                <Link to="/" className="back-btn">
                    <span>&larr;</span> Volver al Catálogo
                </Link>
            </div>

            <div className="detail-content">
                <div className="detail-image-section">
                    <div className="main-image-wrapper" onClick={() => openLightbox(0)} style={{ cursor: 'pointer', position: 'relative' }}>
                        <img
                            src={images[0]}
                            alt={coin.name}
                            className="detail-main-image"
                        />
                        {coin.imageUrls && coin.imageUrls.length > 0 && <span className="zoom-hint" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>🔍 Ampliar Foto</span>}
                    </div>

                    {images.length > 1 && (
                        <div className="thumbnails-gallery" style={{ display: 'flex', gap: '10px', marginTop: '1rem', justifyContent: 'center' }}>
                            {images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    onClick={() => openLightbox(idx)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: currentImageIndex === idx && lightboxOpen === false ? '2px solid #FFD700' : '2px solid transparent',
                                        opacity: currentImageIndex === idx ? 1 : 0.6,
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            ))}
                        </div>
                    )}
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

            {lightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)} style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex',
                    justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
                }}>
                    <button onClick={() => setLightboxOpen(false)} style={{
                        position: 'absolute', top: '20px', right: '30px',
                        background: 'none', border: 'none', color: 'white', fontSize: '2.5rem', cursor: 'pointer'
                    }}>×</button>
                    <img
                        src={images[currentImageIndex]}
                        alt="Expanded view"
                        style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    {images.length > 1 && (
                        <div className="lightbox-controls" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1); }}
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                &larr; Anterior
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                Siguiente &rarr;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DetailPage;
