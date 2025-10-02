import { useState, useMemo } from 'react';
import '../css/StartScreen.css';
import Header from "./Common/Header";
import type { Order } from './App'; // <-- импортируем интерфейс родителя

interface Props {
    onSelectAction: (action: 'take' | 'return') => void;
    onBack: () => void;
    orders: Order[];
}

export default function ActionChoiceScreen({ onSelectAction, onBack, orders }: Props) {
    const [showInfo, setShowInfo] = useState(false);

    // Вычисляем, какие действия активны
    const isTakeActive = useMemo(() => orders.some(order => order.status === 'requested'), [orders]);
    const isReturnActive = useMemo(() => orders.some(order => order.status === 'in_progress'), [orders]);

    return (
        <div className="screen">
            {!showInfo && (
                <div className="glass-card">
                    <Header text={'Выберите действие'} is_back={true} onBack={onBack} />
                    <div className="buttons">
                        {isTakeActive && (
                            <button
                                className="primary-btn"
                                onClick={() => onSelectAction('take')}
                            >
                                Приём инструментов
                            </button>
                        )}

                        {isReturnActive && (
                            <button
                                className="primary-btn"
                                onClick={() => onSelectAction('return')}
                            >
                                Сдача инструментов
                            </button>
                        )}

                        {!isTakeActive && !isReturnActive && (
                            <p>Нет активных заказов</p>
                        )}
                    </div>
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
                        Выберите нужное действие: приём или сдача инструментов.
                        Доступно только при наличии активного заказа соответствующего типа.
                    </p>
                </div>
            )}
        </div>
    );
}
