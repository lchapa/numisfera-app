import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { ethers } from 'ethers';
import NumisferaNFT from '../contracts/NumisferaNFT.json';
import NumisferaAuction from '../contracts/NumisferaAuction.json';
import '../styles/DetailPage.css';

const DetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [coin, setCoin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMinting, setIsMinting] = useState(false);
    
    const [auction, setAuction] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [startingPrice, setStartingPrice] = useState('0.1');
    const [durationDays, setDurationDays] = useState('0');
    const [durationHours, setDurationHours] = useState('24');
    const [durationMinutes, setDurationMinutes] = useState('0');
    const [proxyBid, setProxyBid] = useState('');

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

                const auctionData = await apiService.getAuctionDetails(id);
                setAuction(auctionData);
                setError(null);
            } catch (err) {
                setError('No se pudo cargar la información de la moneda o no existe en el catálogo.');
            } finally {
                setLoading(false);
            }
        };

        fetchCoinDetails();
    }, [id]);

    useEffect(() => {
        if (auction && user) {
            apiService.getUserBids().then((bids) => {
                const myLatestBid = [...bids]
                    .filter(b => b.auction.id === auction.id)
                    .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))[0];

                if (myLatestBid) {
                    setProxyBid(myLatestBid.maxProxyAmount);
                } else {
                    setProxyBid(auction.startingPrice);
                }
            }).catch(err => console.error(err));
        }
    }, [auction, user]);

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="spinner"></div>
                <p>{t('catalog.loading')}</p>
            </div>
        );
    }

    if (error || !coin) {
        return (
            <div className="detail-error">
                <span className="error-icon">⚠️</span>
                <p>{error || t('catalog.noCoins')}</p>
                <Link to="/" className="back-link">{t('detail.backToCatalog')}</Link>
            </div>
        );
    }

    const images = coin.imageUrls && coin.imageUrls.length > 0
        ? coin.imageUrls.map(url => url.startsWith('http') ? url : `${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')}${url}`)
        : ['https://via.placeholder.com/400'];

    const isOwner = user && coin && coin.owner && (user.walletAddress === coin.owner.walletAddress || user.id === coin.owner.id);
    const hasWinner = auction && auction.highestBidderWallet && auction.highestBidderWallet !== '0x0000000000000000000000000000000000000000';
    const isExpired = auction && new Date() > new Date((auction.endTime || '').endsWith('Z') ? auction.endTime : auction.endTime + 'Z');

    const handleMintNFT = async () => {
        if (!window.ethereum) {
            alert('Por favor instala MetaMask u otra Web3 wallet.');
            return;
        }
        
        try {
            setIsMinting(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
            const contract = new ethers.Contract(contractAddress, NumisferaNFT.abi, signer);

            const tokenURI = `ipfs://numisfera.coin/${coin.id}`;

            const tx = await contract.mintPiece(signer.address, tokenURI);
            const receipt = await tx.wait();

            let finalTokenId = "0";
            for (const log of receipt.logs) {
                try {
                    const parsed = contract.interface.parseLog(log);
                    if (parsed && parsed.name === 'PieceMinted') {
                        finalTokenId = parsed.args[0].toString();
                    }
                } catch(e) {}
            }

            const updatedCoin = await apiService.tokenizeCoin(coin.id, finalTokenId, contractAddress);
            setCoin(updatedCoin);
            alert(t('detail.auctionCreated').replace('¡Subasta creada exitosamente!', `¡Éxito! NFT minteado e indexado en Blockchain con ID #${finalTokenId}.`));
        } catch (err) {
            console.error(err);
            alert(t('detail.notMintedFirst').replace('La pieza debe estar minteada primero', 'Fallo al mintear el NFT: ') + (err.reason || err.message));
        } finally {
            setIsMinting(false);
        }
    };

    const handleCreateAuction = async () => {
        if (!window.ethereum) return alert('Instala MetaMask');
        if (!coin.tokenId) return alert('La pieza debe estar minteada primero');
        try {
            setIsActionLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const nftAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
            const auctionAddress = import.meta.env.VITE_AUCTION_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
            
            const nftContract = new ethers.Contract(nftAddress, NumisferaNFT.abi, signer);
            const auctionContract = new ethers.Contract(auctionAddress, NumisferaAuction.abi, signer);

            // 1. Approve
            const approveTx = await nftContract.approve(auctionAddress, coin.tokenId);
            await approveTx.wait();

            // 2. Create Auction on-chain
            const priceInWei = ethers.parseEther(startingPrice);
            const totalSeconds = (parseInt(durationDays || '0') * 24 * 60 * 60) + (parseInt(durationHours || '0') * 60 * 60) + (import.meta.env.DEV ? parseInt(durationMinutes || '0') * 60 : 0);
            
            const minSeconds = import.meta.env.DEV ? 60 : 3600;
            if (totalSeconds < minSeconds) {
                setIsActionLoading(false);
                return alert(import.meta.env.DEV ? "El tiempo mínimo en DEV es 1 minuto." : t('detail.errorTimeInvalid'));
            }
            
            const tx = await auctionContract.createAuction(coin.tokenId, priceInWei, totalSeconds);
            await tx.wait();

            // 3. Save purely to backend
            const newAuction = await apiService.createAuction(coin.id, startingPrice, totalSeconds);
            setAuction(newAuction);
            alert(t('detail.auctionCreated'));
        } catch (err) {
            console.error(err);
            alert(t('detail.errorAuctionCreate') + ' ' + (err.reason || err.message));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!window.ethereum) return alert(t('detail.installMetamask'));
        if (!proxyBid || isNaN(proxyBid)) return alert(t('detail.invalidAmount'));
        try {
            setIsActionLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const auctionAddress = import.meta.env.VITE_AUCTION_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
            const auctionContract = new ethers.Contract(auctionAddress, NumisferaAuction.abi, signer);

            const bidWei = ethers.parseEther(proxyBid);
            const tx = await auctionContract.bid(coin.tokenId, { value: bidWei });
            const receipt = await tx.wait();

            // Fetch the current bid state from the blockchain after the tx to sync backend
            const onchainAuction = await auctionContract.auctions(coin.tokenId);
            const currentBidEther = ethers.formatEther(onchainAuction.currentBid);
            const highestBidderWallet = onchainAuction.highestBidder;

            await apiService.recordBid(auction.id, proxyBid, currentBidEther, highestBidderWallet);
            
            // Reload auction data from API
            const auctionData = await apiService.getAuctionDetails(id);
            setAuction(auctionData);

            alert(t('detail.bidPlaced'));
            setProxyBid('');
        } catch (err) {
            console.error(err);
            alert(t('detail.errorBid') + ' ' + (err.reason || err.message));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSettleAuction = async () => {
        try {
            setIsActionLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const auctionAddress = import.meta.env.VITE_AUCTION_CONTRACT_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
            const auctionContract = new ethers.Contract(auctionAddress, NumisferaAuction.abi, signer);

            const tx = await auctionContract.settleAuction(coin.tokenId);
            await tx.wait();

            await apiService.settleAuctionLocal(auction.id);
            
            const auctionData = await apiService.getAuctionDetails(id);
            setAuction(auctionData);
            alert(t('detail.auctionSettled'));
        } catch(err) {
            console.error(err);
            alert(t('detail.errorSettle') + ' ' + (err.reason || err.message));
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="detail-page slide-up">
            <div className="detail-back-nav">
                <Link to="/" className="back-btn">
                    <span>&larr;</span> {t('detail.backToCatalog')}
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
                        {coin.imageUrls && coin.imageUrls.length > 0 && <span className="zoom-hint" style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>{t('detail.zoomPhoto')}</span>}
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
                        <div className="title-and-badges">
                            <h2>{coin.name}</h2>
                            <div className="detail-badges">
                                <span className="badge badge-year">{coin.year}</span>
                                <span className="badge badge-grade">{coin.grade}</span>
                            </div>
                        </div>
                        {coin.tokenId ? (
                            <div className="nft-badge" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span>{t('detail.nftRegistered').replace('{{tokenId}}', coin.tokenId)}</span>
                                {!auction && user && coin.owner && (user.walletAddress === coin.owner.walletAddress || user.id === coin.owner.id) && (
                                    <div className="auction-form" style={{ marginTop: '1rem', background: '#2C2C2E', padding: '15px', borderRadius: '8px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#FFD700' }}>{t('detail.putOnAuction')}</h4>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <input type="number" step="0.01" value={startingPrice} onChange={e => setStartingPrice(e.target.value)} placeholder={t('detail.startPrice')} style={{ width: '120px', padding: '5px' }} />
                                            <input type="number" value={durationDays} onChange={e => setDurationDays(e.target.value)} placeholder={`0 ${t('detail.days')}`} style={{ width: '60px', padding: '5px' }} />
                                            <input type="number" value={durationHours} onChange={e => setDurationHours(e.target.value)} placeholder={`24 ${t('detail.hours')}`} style={{ width: '70px', padding: '5px' }} />
                                            {import.meta.env.DEV && (
                                                <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder={`0 min`} style={{ width: '60px', padding: '5px' }} title="Solo visible en Desarrollo" />
                                            )}
                                            <button onClick={handleCreateAuction} disabled={isActionLoading} style={{ background: '#FFD700', border: 'none', padding: '6px 12px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>
                                                {isActionLoading ? '...' : t('detail.launchAuction')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            user && coin.owner && (user.walletAddress === coin.owner.walletAddress || user.id === coin.owner.id) && (
                                <button
                                    className="mint-nft-btn"
                                    onClick={handleMintNFT}
                                    disabled={isMinting}
                                    style={{
                                        background: 'linear-gradient(45deg, #FFD700, #FDB931)', border: 'none',
                                        color: '#000', fontWeight: 'bold', padding: '10px 20px', borderRadius: '8px',
                                        cursor: isMinting ? 'not-allowed' : 'pointer', fontSize: '1rem',
                                        opacity: isMinting ? 0.7 : 1, alignSelf: 'flex-start'
                                    }}
                                >
                                    {isMinting ? t('detail.confirmingTx') : t('detail.mintNFT')}
                                </button>
                            )
                        )}
                    </div>
                    
                    {auction && (
                        <div className="auction-active-panel" style={{ background: 'linear-gradient(135deg, #1A1A1D, #2C2C2E)', border: '1px solid #FFD700', borderRadius: '12px', padding: '20px', marginTop: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,215,0,0.3)', paddingBottom: '10px', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, color: '#FFD700' }}>
                                    {auction.active ? t('detail.auctionActive') : t('detail.auctionFinished')}
                                </h3>
                                <span>{t('detail.expires')} {new Date((auction.endTime || '').endsWith('Z') ? auction.endTime : auction.endTime + 'Z').toLocaleString()}</span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                                <div>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#AAA' }}>{t('detail.initialPrice')}</p>
                                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{auction.startingPrice} ETH</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#AAA' }}>{t('detail.currentWinningBid')}</p>
                                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>{auction.currentBid} ETH</p>
                                </div>
                            </div>

                            {auction.active && user && (!coin.owner || user.id !== coin.owner.id) && (
                                <div className="bid-form" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <input 
                                        type="number" step="0.01" 
                                        value={proxyBid} 
                                        onChange={e => setProxyBid(e.target.value)} 
                                        placeholder={t('detail.yourMaxLimit')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#111', color: '#FFF' }}
                                    />
                                    <button onClick={handlePlaceBid} disabled={isActionLoading} style={{ background: '#FFD700', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', color: '#000' }}>
                                        {isActionLoading ? t('detail.processing') : t('detail.placeProxyBid')}
                                    </button>
                                </div>
                            )}

                            {auction.active && isExpired && isOwner && hasWinner && (
                                <button onClick={handleSettleAuction} disabled={isActionLoading} style={{ width: '100%', marginTop: '15px', background: '#E74C3C', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', color: '#FFF', cursor: 'pointer' }}>
                                    {t('detail.settleAuction')}
                                </button>
                            )}
                            {auction.active && isExpired && isOwner && !hasWinner && (
                                <button onClick={handleSettleAuction} disabled={isActionLoading} style={{ width: '100%', marginTop: '15px', background: '#888', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', color: '#FFF', cursor: 'pointer' }}>
                                    Cerrar y Recuperar (Sin Ofertas)
                                </button>
                            )}
                        </div>
                    )}

                    <p className="detail-country">{coin.country}</p>

                    <div className="detail-description">
                        <h3>{t('detail.history')}</h3>
                        <p>{coin.description || t('detail.noDescription')}</p>
                    </div>

                    <div className="detail-specs">
                        <h3>{t('detail.specs')}</h3>
                        <ul className="specs-list">
                            <li>
                                <span className="spec-label">{t('detail.material')}</span>
                                <span className="spec-value">{coin.material}</span>
                            </li>
                            <li>
                                <span className="spec-label">{t('detail.year')}</span>
                                <span className="spec-value">{coin.year}</span>
                            </li>
                            <li>
                                <span className="spec-label">{t('detail.country')}</span>
                                <span className="spec-value">{coin.country}</span>
                            </li>
                            <li>
                                <span className="spec-label">{t('detail.grade')}</span>
                                <span className="spec-value">{coin.grade}</span>
                            </li>
                            {user && coin.owner && (
                                <li>
                                    <span className="spec-label">{t('detail.owner')}</span>
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
                                {t('detail.previous')}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                {t('detail.next')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DetailPage;
