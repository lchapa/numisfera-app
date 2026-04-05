import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/AuctionsPage.css';

const AuctionsPage = () => {
    const { t } = useTranslation();
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
                data.filter(bid => bid.auction.active).forEach(bid => {
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
                <p>{t('auctions.loading')}</p>
            </div>
        );
    }

    return (
        <div className="auctions-container slide-up">
            <h2>{t('auctions.title')}</h2>
            <p style={{ color: '#AAA', marginBottom: '30px' }}>
                {t('auctions.subtitle')}
            </p>

            {bids.length === 0 ? (
                <div className="no-bids">
                    <p>{t('auctions.noBids')}</p>
                    <Link to="/" className="search-coins-btn">{t('auctions.exploreCatalog')}</Link>
                </div>
            ) : (
                <div className="bids-grid">
                    {bids.map((bid) => {
                        const isWinning = user.walletAddress && bid.auction.highestBidderWallet && 
                                        user.walletAddress.toLowerCase() === bid.auction.highestBidderWallet.toLowerCase();
                        
                        const statusColor = isWinning ? '#27AE60' : '#E74C3C';
                        const statusIcon = isWinning ? '🏆' : '💀';
                        const statusText = isWinning ? t('auctions.statusWinning') : t('auctions.statusOutbid');
                        const expired = new Date() > new Date(bid.auction.endTime);

                        return (
                            <div key={bid.id} className="bid-card" style={{ borderColor: expired ? '#555' : statusColor }}>
                                <div className="bid-header">
                                    <h3>{bid.auction.coin.name}</h3>
                                    <span className="auction-status" style={{ background: expired ? '#555' : statusColor }}>
                                        {expired ? t('auctions.statusFinished') : `${statusIcon} ${statusText}`}
                                    </span>
                                </div>
                                
                                <div className="bid-body">
                                    <div className="bid-stat">
                                        <label>{t('auctions.currentCost')}</label>
                                        <p className="actual-cost">{bid.auction.currentBid} ETH</p>
                                    </div>
                                    <div className="bid-stat proxy">
                                        <label>{t('auctions.maxBudget')}</label>
                                        <p>{bid.maxProxyAmount} ETH</p>
                                    </div>
                                    <div className="bid-stat time">
                                        <label>{t('auctions.expirationDate')}</label>
                                        <p>{new Date(bid.auction.endTime).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bid-actions">
                                    <Link to={`/coin/${bid.auction.coin.id}`} className="view-auction-btn">
                                        {t('auctions.viewDetails')}
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
