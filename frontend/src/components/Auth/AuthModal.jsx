import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { BrowserProvider } from 'ethers';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
    const { login } = useContext(AuthContext);

    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLoginView) {
                const data = await apiService.login({ email, password });
                login(data);
                onClose();
            } else {
                await apiService.register({ email, password });
                // Switch to login automatically
                setIsLoginView(true);
                setError('Registro exitoso. Ahora inicia sesión.');
            }
        } catch (err) {
            setError(err.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleWeb3Login = async () => {
        if (!window.ethereum) {
            setError('Metamask no fue detectado en tu navegador.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Request account access
            const provider = new BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const publicAddress = await signer.getAddress();

            // Create a custom message to sign
            const message = `Bienvenido a Numisfera.\nFirma este mensaje para verificar que eres el dueño de esta Wallet.\nTimestamp: ${Date.now()}`;

            // Generate Signature
            const signature = await signer.signMessage(message);

            // Send to backend
            const web3Data = {
                publicAddress,
                signature,
                message
            };

            const data = await apiService.web3Login(web3Data);
            login(data);
            onClose();

        } catch (err) {
            console.error(err);
            setError(err.message || 'Error iniciando sesión con Metamask');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-modal pop-in">
                <button className="auth-close" onClick={onClose}>&times;</button>
                <h2>{isLoginView ? 'Iniciar Sesión' : 'Registrarse'}</h2>

                {error && <div className={`auth-error ${error.includes('exitoso') ? 'success' : ''}`}>{error}</div>}

                <form onSubmit={handleEmailAuth}>
                    <div className="auth-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="auth-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Redirigiendo...' : (isLoginView ? 'Ingresar' : 'Crear Cuenta')}
                    </button>

                    <div className="auth-switch">
                        {isLoginView ? (
                            <p>¿No tienes cuenta? <span onClick={() => { setIsLoginView(false); setError(null); }}>Regístrate</span></p>
                        ) : (
                            <p>¿Ya tienes cuenta? <span onClick={() => { setIsLoginView(true); setError(null); }}>Inicia Sesión</span></p>
                        )}
                    </div>
                </form>

                <div className="auth-divider">
                    <span>O continuar de forma descentralizada</span>
                </div>

                <button className="auth-crypto-btn" onClick={handleWeb3Login} disabled={loading}>
                    Conectar Metamask / Web3 Wallet
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
