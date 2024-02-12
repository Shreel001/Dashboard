require('dotenv').config();
const { BASE_URL, INSTITUTION_NAME ,BASIC_AUTHORIZATION_HEADER, BEARER_AUTHORIZATION_TOKEN, GROUP_ID } = require('./env');

/* Authorization header */
const headers = {
    'Authorization': `Bearer 6665f56a78fefaf4dd13d0f0f8dea0553adb74a0331e42ece1864537bc9213625f258ff9895d43a6fc56c1949f55a13420300bdb4596d1b99858faccdb9c92f6`,
    'Content-Type': 'application/json',
};

const getGroupIDs = async () => {
    try {
        const api = `https://api.figshare.com/v2/account/institution/groups`;
        const response = await fetch(api, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json_response = await response.json();

        const result = json_response.map(article => ({ name: article.name, id: article.id }))

        // const faculty = json_response
        //     .filter(article => article.parent_id == 35349 || article.parent_id == 0) // Exclude specific parent IDs
        //     .map(article => ({ name: article.name, id: article.id })); // Extract group IDs

        // const department = json_response
        //     .filter(article => article.parent_id !== 35349 && article.parent_id !== 0) // Exclude specific parent IDs
        //     .map(article => ({ name: article.name, id: article.id })); // Extract group IDs

        return result;
    } catch (error) {
        console.error('Error fetching group IDs:', error);
        return null;
    }
};

module.exports = getGroupIDs;