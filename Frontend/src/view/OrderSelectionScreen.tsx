import { useState, useMemo } from 'react';
import '../css/StartScreen.css';
import '../css/Order.css';
import type { Order } from './App';
import Header from './Common/Header';

interface Props {
    onSelectOrder: (order: Order) => void;
    onBack: () => void;
    orders: Order[];
    action: 'take' | 'return' | null; // действие, выбранное на шаге 3
}
const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // месяцы 0-11
    const year = date.getFullYear();


    return `${day}.${month}.${year}`;
};
const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
};

export default function OrderSelectionScreen({ onSelectOrder, onBack, orders, action }: Props) {
    const [showInfo, setShowInfo] = useState(false);

    // Фильтруем заказы по действию
    const filteredOrders = useMemo(() => {
        if (!action) return [];
        if (action === 'take') return orders.filter(order => order.status === 'requested');
        if (action === 'return') return orders.filter(order => order.status === 'in_progress');
        return [];
    }, [orders, action]);

    return (
        <div className="screen">
            {!showInfo && (
                <div className="glass-card">
                    <Header text="Выберите заказ" is_back={true} onBack={onBack} />

                    {filteredOrders.length === 0 ? (
                        <p>Нет доступных заказов для выбранного действия</p>
                    ) : (
                        <div className={'table-wrapper'}>
                            <table className="order-table">
                                <thead>
                                <tr>
                                    <th>ID заказа</th>
                                    <th>Дата</th>
                                    <th>Время</th>

                                    <th>Набор инструментов</th>
                                    <th>Статус</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.order_id} onClick={() => onSelectOrder(order)}>
                                        <td>{order.order_id}</td>
                                        <td>{formatDate(order.created_at)}</td>
                                        <td>{formatTime(order.created_at)}</td>

                                        <td>{order.toolset_name}</td>
                                        <td>{order.status}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showInfo && (
                <div className="glass-card info-card">
                    <button
                        className="close-btn"
                        onClick={() => setShowInfo(false)}
                        aria-label="Закрыть"
                    >
                        ×
                    </button>
                    <h2>Информация</h2>
                    <p>
                        Выберите заказ из списка. Нажмите на строку с нужным заказом для продолжения.
                        Показаны только заказы, соответствующие выбранному действию (приём или сдача инструментов).
                    </p>
                </div>
            )}
        </div>
    );
}
