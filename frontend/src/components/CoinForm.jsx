import { useState, useEffect } from 'react';
import '../styles/CoinForm.css';

const CoinForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const MAX_IMAGES = parseInt(import.meta.env.VITE_MAX_IMAGES || '3', 10);
    const [selectedImages, setSelectedImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        country: '',
        year: '',
        material: '',
        description: '',
        grade: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                country: initialData.country || '',
                year: initialData.year || '',
                material: initialData.material || '',
                description: initialData.description || '',
                grade: initialData.grade || ''
            });
            if (initialData.imageUrls && initialData.imageUrls.length > 0) {
                setExistingImages(initialData.imageUrls);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > MAX_IMAGES) {
            alert(`Solo puedes subir un máximo de ${MAX_IMAGES} fotos.`);
            e.target.value = ''; // Reset input
            setSelectedImages([]);
            return;
        }
        setSelectedImages(files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const submissionData = {
            ...formData,
            year: parseInt(formData.year, 10) || null
        };

        const fd = new FormData();
        fd.append('coin', JSON.stringify(submissionData));

        selectedImages.forEach((img) => {
            fd.append('images', img);
        });

        onSubmit(fd);
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
                    <label htmlFor="images">Fotografías (Sube hasta {MAX_IMAGES})</label>
                    <input
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="file-input"
                    />
                    {existingImages.length > 0 && selectedImages.length === 0 && (
                        <div className="image-previews">
                            <p>Fotos actuales:</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                {existingImages.map((url, idx) => (
                                    <img key={idx} src={url.startsWith('http') ? url : `${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')}${url}`} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                ))}
                            </div>
                        </div>
                    )}
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
