import { useState, useEffect } from 'react';
import '../styles/CoinForm.css';

const CoinForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        year: '',
        material: '',
        description: '',
        grade: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                country: initialData.country || '',
                year: initialData.year || '',
                material: initialData.material || '',
                description: initialData.description || '',
                grade: initialData.grade || '',
                imageUrl: initialData.imageUrl || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // basic casting
        const submissionData = {
            ...formData,
            year: parseInt(formData.year, 10) || null
        };
        onSubmit(submissionData);
    };

    return (
        <form className="coin-form slide-down" onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group span-2">
                    <label htmlFor="name">Nombre de la Moneda</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Centenario de Oro"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="country">País</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="Ej: México"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="year">Año de Emisión</label>
                    <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 1921"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="material">Material</label>
                    <input
                        type="text"
                        id="material"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Oro"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="grade">Grado / Conservación</label>
                    <input
                        type="text"
                        id="grade"
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        required
                        placeholder="Ej: MS-62"
                    />
                </div>

                <div className="form-group span-2">
                    <label htmlFor="imageUrl">URL de la Imagen</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                    />
                </div>

                <div className="form-group span-2">
                    <label htmlFor="description">Descripción e Historia</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Escribe la historia o detalles históricos aquí..."
                    ></textarea>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Guardando...' : (initialData ? 'Actualizar Moneda' : 'Registrar Moneda')}
                </button>
            </div>
        </form>
    );
};

export default CoinForm;
