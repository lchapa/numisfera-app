import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AuctionsPage.css';

const AuctionsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        const fetchBids = async () => {
            try {
                const data = await apiService.getUserBids();
                // Filter out duplicates if the user naturally bid multiple times on the same auction to just show the latest proxy they committed per auction.
                const uniqueAuctionsMap = new Map();
                data.forEach(bid => {
                    const existing = uniqueAuctionsMap.get(bid.auction.id);
                    if (!existing || new Date(bid.bidTime) > new Date(existing.bidTime)) {
                        uniqueAuctionsMap.set(bid.auction.id, bid);
                    }
                });
                
                setBids(Array.from(uniqueAuctionsMap.values()));
            } catch (err) {
                console.error("Error fetching bids", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBids();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="auctions-container">
                <div className="spinner"></div>
                <p>Cargando tus subastas proxy...</p>
            </div>
        );
    }

    return (
        <div className="auctions-container slide-up">
            <h2>Mis Subastas Activas (Proxy Bidding)</h2>
            <p style={{ color: '#AAA', marginBottom: '30px' }}>
                Monitoreo en tiempo real de tus ofertas. El algoritmo on-chain se encarga de luchar por ti hasta alcanzar tu límite máximo.
            </p>

            {bids.length === 0 ? (
                <div className="no-bids">
                    <p>No tienes ofertas proxy vigentes.</p>
                    <Link to="/" className="search-coins-btn">Explorar Catálogo</Link>
                </div>
            ) : (
                <div className="bids-grid">
                    {bids.map((bid) => {
                        const isWinning = Number(bid.maxProxyAmount) >= Number(bid.auction.currentBid);
                        const statusColor = isWinning ? '#27AE60' : '#E74C3C';
                        const statusIcon = isWinning ? '🏆' : '💀';
                        const statusText = isWinning ? 'Estás Ganando' : 'Superado';
                        const expired = new Date() > new Date(bid.auction.endTime);

                        return (
                            <div key={bid.id} className="bid-card" style={{ borderColor: expired ? '#555' : statusColor }}>
                                <div className="bid-header">
                                    <h3>{bid.auction.coin.name}</h3>
                                    <span className="auction-status" style={{ background: expired ? '#555' : statusColor }}>
                                        {expired ? '🏁 Terminada' : `${statusIcon} ${statusText}`}
                                    </span>
                                </div>
                                
                                <div className="bid-body">
                                    <div className="bid-stat">
                                        <label>Costo Actual (Blockchain)</label>
                                        <p className="actual-cost">{bid.auction.currentBid} ETH</p>
                                    </div>
                                    <div className="bid-stat proxy">
                                        <label>Tu Presupuesto Máximo (Bloqueado)</label>
                                        <p>{bid.maxProxyAmount} ETH</p>
                                    </div>
                                    <div className="bid-stat time">
                                        <label>Fecha de Expiración</label>
                                        <p>{new Date(bid.auction.endTime).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bid-actions">
                                    <Link to={`/coin/${bid.auction.coin.id}`} className="view-auction-btn">
                                        Ver Detalles y Ajustar Puja
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AuctionsPage;
