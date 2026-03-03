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
    },

    /**
     * Creates a new coin.
     * @param {Object} coinData - The details of the new coin.
     * @returns {Promise<Object>} A promise that resolves to the created coin.
     */
    createCoin: async (coinData) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(coinData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating coin:', error);
            throw error;
        }
    },

    /**
     * Updates an existing coin.
     * @param {number|string} id - The ID of the coin to update.
     * @param {Object} coinData - The new data of the coin.
     * @returns {Promise<Object>} A promise that resolves to the updated coin.
     */
    updateCoin: async (id, coinData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(coinData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating coin with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Deletes a coin by its ID.
     * @param {number|string} id - The ID of the coin to delete.
     * @returns {Promise<void>} 
     */
    deleteCoin: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Usually delete endpoints return 204 No Content, so we don't parse JSON
        } catch (error) {
            console.error(`Error deleting coin with id ${id}:`, error);
            throw error;
        }
    }
};
