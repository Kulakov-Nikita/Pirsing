export const domain: string = 'http://pirsiing.duckdns.org';


export async function getOrdersByEmployeeId(employeeId: string) {
    try {
        const response = await fetch(`${domain}/orders/?employee_id=${employeeId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка запроса: ${response.status}`);
        }
        console.log(response)

        const data = await response.json();
        return data; // массив заказов
    } catch (error) {
        console.error('Ошибка при запросе заказов:', error);
        throw error;
    }
}