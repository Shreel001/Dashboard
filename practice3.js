const {BEARER_AUTHORIZATION_TOKEN, CONTENT_URL, } = require('./utils/env')

const headers = {
    'Authorization' : `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type' : 'application/json',
};

const data = async () => {
    try {
        const response = await fetch(`${CONTENT_URL}/articles?page=1&page_size=1000&group=35541`, { headers });
        const result = await response.json()
        const id = await result.map(item => item.id)
        
        

        if (!response.ok) {
            // Log status code if error
            console.error("Status Code:", response.status);
            throw new Error('Request failed with status ' + response.status);
        }

        return id;
    } catch (error) {
        console.error("Error:", error.message);
        throw error; // Re-throw the error to be caught outside of this function
    }
};

data()
    .then(data => console.log(data))
    .catch(error => console.error("Data retrieval failed:", error));