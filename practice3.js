const {BEARER_AUTHORIZATION_TOKEN} = require('./utils/env')

const headers = {
    'Authorization' : `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type' : 'application/json',
};

const data = async () => {
    try {
        const response = await fetch(`https://api.figshare.com/v2/account/articles/22223344/authors`, { headers });
        
        // Log request headers
        console.log("Request Headers:", headers);

        if (!response.ok) {
            // Log status code if error
            console.error("Status Code:", response.status);
            throw new Error('Request failed with status ' + response.status);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error:", error.message);
        throw error; // Re-throw the error to be caught outside of this function
    }
};

data()
    .then(data => console.log(data))
    .catch(error => console.error("Data retrieval failed:", error));