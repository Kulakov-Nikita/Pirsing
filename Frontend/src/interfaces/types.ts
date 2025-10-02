// src/types/index.ts

export type Tool =
    | 'Отвёртка крестовая'
    | 'Отвёртка крестовая плоская'
    | 'Ключ на 12'
    | 'Ключ на 11';

export type InputMode = 'camera' | 'upload';

export interface SessionData {
    employeeId: string;
    image: string | null;
    selectedTools: Tool[];
    inputMode: InputMode | null;
}