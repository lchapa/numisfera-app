import { useParams } from 'react-router-dom';

const DetailPage = () => {
    const { id } = useParams();

    return (
        <div className="detail-page">
            <h2>Detalles de Moneda #{id}</h2>
            <p>Aquí se mostrarán los datos completos (próximamente).</p>
        </div>
    );
};

export default DetailPage;
