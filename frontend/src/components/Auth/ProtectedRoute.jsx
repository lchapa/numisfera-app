import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', color: '#FFD700' }}>
                <h2>Verificando Identidad...</h2>
            </div>
        );
    }

    if (!user) {
        // Redirigir al inicio si no hay usuario logueado
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirigir al inicio si no tiene permisos suficientes
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
