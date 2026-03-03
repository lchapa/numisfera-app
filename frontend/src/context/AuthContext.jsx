import { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState('USER_ANONYMOUS');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load session from local storage on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setRole(storedRole || 'USER_SIMPLE');
        }
        setIsLoading(false);
    }, []);

    const login = (jwtData) => {
        const userData = {
            id: jwtData.id,
            email: jwtData.email,
            walletAddress: jwtData.walletAddress
        };
        setUser(userData);
        setToken(jwtData.token);
        setRole(jwtData.role);

        localStorage.setItem('token', jwtData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', jwtData.role);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole('USER_ANONYMOUS');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{ user, token, role, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
