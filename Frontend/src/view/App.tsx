import { useState } from 'react';

import StartScreen from './StartScreen';
import ActionChoiceScreen from './ActionChoiceScreen';
import EmployeeNumberScreen from "./EmployeeNumberScreen";
import OrderSelectionScreen from "./OrderSelectionScreen";
import PhotoStep from "./PhotoStep";
import RecognizeScreen from "./RecognizeScreen"; // <-- новый компонент

import type { Tool, InputMode } from '../interfaces/types';

export interface Order {
    order_id: string;
    created_at: string;
    status:string;
    actual_tools: string[];
    employee_id:string;
    toolset_name:string

}
export interface BBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    confidence: number; // 0..1
    class_id: number;
    class_name: string;
}
export interface SessionData {
    photo: string;
    bboxes: BBox[];
    status: string;
}


function App() {
    const [step, setStep] = useState<number>(1); // шаги: 1–6
    const [employeeId, setEmployeeId] = useState<string>('');
    const [orders, setOrders] = useState<Order[]>([]); // добавили состояние заказов
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [selectedAction, setSelectedAction] = useState<'take' | 'return' | null>(null);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);

    const goToNext = () => setStep((prev) => Math.min(prev + 1, 6));
    const onBack = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleEmployeeNext = (id: string) => {
        setEmployeeId(id);
        goToNext();
    };

    const handleActionSelect = (action: 'take' | 'return') => {
        setSelectedAction(action);
        goToNext();
    };

    const handleOrderSelect = (order: Order) => {
        setActiveOrder(order);
        goToNext();
    };

    const handlePhotoNext = (data: SessionData) => {
        setSessionData(data);
        goToNext();
    };


    const handleFinishSession = () => {
        setStep(1);
    };


    // @ts-ignore
    return (
        <div className="app">
            {step === 1 && <StartScreen goNext={goToNext} />}
            {step === 2 && (
                <EmployeeNumberScreen
                    onNext={goToNext}
                    onBack={onBack}
                    setOrders={setOrders} // передаём функцию для установки заказов
                />
            )}
            {step === 3 && (
                <ActionChoiceScreen
                    onSelectAction={handleActionSelect}
                    onBack={onBack}
                    orders={orders}
                />
            )}
            {step === 4 && (
                <OrderSelectionScreen
                    onSelectOrder={handleOrderSelect}
                    onBack={onBack}
                    orders={orders}
                    action={selectedAction}

                />
            )}
            {step === 5 && (
                <PhotoStep
                    onNext={handlePhotoNext} // сохраняем фото
                    onBack={onBack}
                    employeeId={employeeId}
                    order={activeOrder ?? {
                        order_id: '',
                        created_at: '',
                        status: '',
                        actual_tools: [],
                        employee_id: '',
                        toolset_name: ''
                    }}                />
            )}
            {step === 6 && sessionData && (
                <RecognizeScreen
                    photoUrl={sessionData.photo}
                    bboxes={sessionData.bboxes}
                    originalSet={activeOrder?.actual_tools ?? []}
                    onFinish={handleFinishSession}
                />
            )}

        </div>
    );
}

export default App;
