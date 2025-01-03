const API_KEY = 'DwubsVWBQzrAI1rY529XjbZy1rny84BA3XaIujP0';
const BASE_URL = 'https://api.freecurrencyapi.com/v1/latest';

// Anlık döviz kuru alma
async function getExchangeRate(fromCurrency, toCurrency) {
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&base_currency=${fromCurrency}`);
        const data = await response.json();
        
        if (data.data && data.data[toCurrency]) {
            return data.data[toCurrency];
        } else {
            throw new Error('Döviz kuru alınamadı');
        }
    } catch (error) {
        console.error('Döviz kuru alma hatası:', error);
        return null;
    }
}