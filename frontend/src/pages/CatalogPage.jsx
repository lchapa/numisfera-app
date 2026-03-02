import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import CoinCard from '../components/CoinCard';
import '../styles/CatalogPage.css';

const CatalogPage = () => {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                setLoading(true);
                const data = await apiService.getAllCoins();
                setCoins(data);
                setError(null);
            } catch (err) {
                setError('Ocurrió un error al cargar el catálogo de monedas. Verifica tu conexión al servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

    return (
        <div className="catalog-page">
            <div className="catalog-header">
                <h2>Catálogo de Exhibición</h2>
                <p>Explora nuestra colección curada de monedas históricas para numismáticos exigentes.</p>
            </div>

            {loading && (
                <div className="catalog-loading">
                    <div className="spinner"></div>
                    <p>Cargando el archivo numismático...</p>
                </div>
            )}

            {error && (
                <div className="catalog-error">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && coins.length === 0 && (
                <div className="catalog-empty">
                    <p>El catálogo se encuentra vacío en este momento.</p>
                </div>
            )}

            {!loading && !error && coins.length > 0 && (
                <div className="coins-grid">
                    {coins.map((coin) => (
                        <CoinCard key={coin.id} coin={coin} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
