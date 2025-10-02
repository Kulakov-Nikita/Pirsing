import { useState } from 'react';
import '../css/StartScreen.css';
import Header from "./Common/Header";
import { Order } from "./App";
import {getOrdersByEmployeeId} from "../utils"; // туда положи интерфейс Order

interface Props {
    onNext: () => void;
    onBack: () => void;
    setOrders: (orders: Order[]) => void;
}


export default function EmployeeNumberScreen({ onNext, onBack, setOrders }: Props) {
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (employeeNumber.trim() === '') {
            alert('Пожалуйста, введите табельный номер');
            return;
        }

        setLoading(true);
        try {
            // 🟢 здесь подставляем мок
            const data = await getOrdersByEmployeeId(employeeNumber);
            setOrders(data);
            onNext();
        } catch (err) {
            alert('Ошибка при получении заказов. Проверьте табельный номер.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="screen">
            {!showInfo && (
                <div className="glass-card">
                    <Header text={'Введите табельный номер'} is_back={true} onBack={onBack} />

                    <input
                        type="text"
                        className="employee-input"
                        placeholder="Например: E12345"
                        value={employeeNumber}
                        onChange={(e) => setEmployeeNumber(e.target.value)}
                    />

                    <div className="buttons">
                        <button className="primary-btn" onClick={handleNext} disabled={loading}>
                            {loading ? "Загрузка..." : "Далее"}
                        </button>
                        <button className="secondary-btn" onClick={() => setShowInfo(true)}>Информация</button>
                    </div>
                </div>
            )}

            {showInfo && (
                <div className="glass-card info-card">
                    <button className="close-btn" onClick={() => setShowInfo(false)}>×</button>
                    <h2>Информация</h2>
                    <p>
                        Введите ваш табельный номер в поле выше.
                        Это необходимо для идентификации сотрудника перед началом работы с инструментами.
                        Валидный табельный номер: E00001
                    </p>
                </div>
            )}
        </div>
    );
}
