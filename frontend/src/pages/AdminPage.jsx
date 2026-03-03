import { useState, useEffect, useContext } from 'react';
import { apiService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import CoinForm from '../components/CoinForm';
import '../styles/AdminPage.css';

const AdminPage = () => {
    const { user, role } = useContext(AuthContext);
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCoin, setEditingCoin] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Delete Confirmation Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [coinToDelete, setCoinToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchCoins = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAllCoins();
            setCoins(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar inventario.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoins();
    }, []);

    // Filter coins for Wallet users. Admin sees all.
    const displayCoins = role === 'ADMIN' ? coins : coins.filter(c => c.owner?.id === user?.id);

    // Form Handlers
    const handleOpenCreateForm = () => {
        setEditingCoin(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (coin) => {
        setEditingCoin(coin);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCoin(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            setFormLoading(true);
            if (editingCoin) {
                await apiService.updateCoin(editingCoin.id, formData);
            } else {
                await apiService.createCoin(formData);
            }
            handleCloseForm();
            fetchCoins(); // Refresh table
        } catch (err) {
            alert('Ocurrió un error guardando la moneda. Revisa consola.');
        } finally {
            setFormLoading(false);
        }
    };

    // Delete Handlers
    const confirmDelete = (coin) => {
        setCoinToDelete(coin);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = async () => {
        if (!coinToDelete) return;
        try {
            setDeleteLoading(true);
            await apiService.deleteCoin(coinToDelete.id);
            setDeleteModalOpen(false);
            setCoinToDelete(null);
            fetchCoins(); // Refresh table
        } catch (err) {
            alert('Error al tratar de eliminar la moneda.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setCoinToDelete(null);
    };

    if (role === 'USER_SIMPLE') {
        return (
            <div className="admin-page slide-up" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <span style={{ fontSize: '4rem' }}>🔒</span>
                <h2 style={{ color: '#fca5a5', marginTop: '1rem' }}>Acceso Denegado</h2>
                <p style={{ color: '#94a3b8' }}>Tu cuenta es de visualización. Solo Administradores y Billeteras pueden gestionar monedas propias.</p>
            </div>
        );
    }

    return (
        <div className="admin-page slide-up">
            <div className="admin-header">
                <div>
                    <h2>Panel de Administración Numismática</h2>
                    <p>Gestiona, edita o retira piezas de tu inventario histórico.</p>
                    {role === 'USER_WALLET' && (
                        <span className="badge" style={{ marginTop: '0.8rem', display: 'inline-block', background: 'rgba(246, 133, 27, 0.2)', color: '#F6851B', border: '1px solid #F6851B' }}>
                            Modo Web3: Mostrando solo tus monedas firmadas.
                        </span>
                    )}
                </div>
                {!isFormOpen && (
                    <button className="btn-add-coin" onClick={handleOpenCreateForm}>
                        + Añadir Nueva Moneda
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="admin-form-container">
                    <h3>{editingCoin ? `Editando: ${editingCoin.name}` : 'Registrar Nueva Pieza'}</h3>
                    <CoinForm
                        initialData={editingCoin}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCloseForm}
                        loading={formLoading}
                    />
                </div>
            )}

            {/* Tabla de Monedas */}
            {!isFormOpen && (
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loading"><div className="spinner"></div><p>Cargando registros...</p></div>
                    ) : error ? (
                        <div className="catalog-error"><p>{error}</p></div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Moneda</th>
                                    <th>País</th>
                                    <th>Año</th>
                                    <th>Conservación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayCoins.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="table-empty">
                                            {role === 'USER_WALLET' ? 'Aún no posees ninguna moneda. ¡Agrega una a tu wallet!' : 'No hay monedas en el archivo.'}
                                        </td>
                                    </tr>
                                ) : (
                                    displayCoins.map(coin => (
                                        <tr key={coin.id}>
                                            <td className="td-id">#{coin.id}</td>
                                            <td className="td-name"><strong>{coin.name}</strong></td>
                                            <td>{coin.country}</td>
                                            <td>{coin.year}</td>
                                            <td><span className="badge badge-grade-small">{coin.grade}</span></td>
                                            <td className="td-actions">
                                                <button className="btn-edit" onClick={() => handleOpenEditForm(coin)}>Editar</button>
                                                <button className="btn-delete" onClick={() => confirmDelete(coin)}>Borrar</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal Overlay */}
            {deleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content pop-in">
                        <h3>⚠️ Confirmar Eliminación</h3>
                        <p>¿Estás completamente seguro que deseas retirar <strong>{coinToDelete?.name}</strong> del catálogo?</p>
                        <p className="modal-warning">Esta acción destruirá el registro de la base de datos y no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={cancelDelete} disabled={deleteLoading}>Cancelar</button>
                            <button className="btn-modal-confirm" onClick={handleExecuteDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Eliminando...' : 'Sí, Eliminar Definitivamente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
