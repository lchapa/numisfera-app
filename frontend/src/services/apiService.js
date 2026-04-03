const API_BASE_URL = 'http://localhost:8080/api/coins';
const AUTH_URL = 'http://localhost:8080/api/auth';

const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const apiService = {
    // ---- AUTHENTICATION ENDPOINTS ----

    login: async (credentials) => {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error en login');
        }
        return await response.json();
    },

    register: async (credentials) => {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error en registro');
        }
        return await response.json();
    },

    web3Login: async (web3Data) => {
        const response = await fetch(`${AUTH_URL}/web3/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(web3Data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error en firma Web3');
        }
        return await response.json();
    },

    // ---- CATALOG & COIN ENDPOINTS ----

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
     * @param {FormData} coinData - The details of the new coin including images as FormData.
     * @returns {Promise<Object>} A promise that resolves to the created coin.
     */
    createCoin: async (coinData) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: getHeaders(true),
                body: coinData
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Error ${response.status}: ${err}`);
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
     * @param {FormData} coinData - The new data of the coin including images as FormData.
     * @returns {Promise<Object>} A promise that resolves to the updated coin.
     */
    updateCoin: async (id, coinData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(true),
                body: coinData
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Error ${response.status}: ${err}`);
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
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Usually delete endpoints return 204 No Content, so we don't parse JSON
        } catch (error) {
            console.error(`Error deleting coin with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Updates the coin explicitly marking it as tokenized with its blockchain data
     * @param {number|string} id 
     * @param {string} tokenId
     * @param {string} contractAddress
     */
    tokenizeCoin: async (id, tokenId, contractAddress) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}/tokenize`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ tokenId, contractAddress })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error tokenizing coin with id ${id}:`, error);
            throw error;
        }
    },

    // ---- AUCTION ENDPOINTS ----
    createAuction: async (coinId, startingPrice, durationSeconds) => {
        const res = await fetch(`http://localhost:8080/api/auctions/${coinId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ startingPrice, durationSeconds })
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    getAuctionDetails: async (coinId) => {
        const res = await fetch(`http://localhost:8080/api/auctions/${coinId}`, {
            headers: getHeaders()
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    recordBid: async (auctionId, proxyAmount, currentBid) => {
        const res = await fetch(`http://localhost:8080/api/auctions/${auctionId}/bid`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ proxyAmount, currentBid })
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    },

    settleAuctionLocal: async (auctionId) => {
        const res = await fetch(`http://localhost:8080/api/auctions/${auctionId}/settle`, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
    },

    getUserBids: async () => {
        const res = await fetch(`http://localhost:8080/api/auctions/user`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
    }
};
