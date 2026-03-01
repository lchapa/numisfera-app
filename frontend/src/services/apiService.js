const API_BASE_URL = 'http://localhost:8080/api/coins';

export const apiService = {
    /**
     * Fetches the complete list of coins from the backend.
     * @returns {Promise<Array>} A promise that resolves to an array of coin objects.
     */
    getAllCoins: async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching coins:', error);
            throw error;
        }
    },

    /**
     * Fetches a single coin by its ID.
     * @param {number|string} id - The ID of the coin to retrieve.
     * @returns {Promise<Object>} A promise that resolves to the coin object.
     */
    getCoinById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching coin with id ${id}:`, error);
            throw error;
        }
    }
};
