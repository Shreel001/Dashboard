require('dotenv').config()

/* Enviroment variables */
const BEARER_AUTHORIZATION_TOKEN = process.env.BEARER_AUTHORIZATION_TOKEN
var facualty = []
var department = []

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
};

const fetchData = async () => {
    const api = `https://api.figshare.com/v2/account/institution/groups`;
    const response = await fetch(api, { headers });
    const json_response = await response.json();

    // console.log(json_response)

    const facualty = json_response
        .filter(article => article.parent_id == 35349 || article.parent_id == 0) // Exclude specific parent IDs
        .map(article => ({ name: article.name, id: article.id })); // Extract group IDs

    const department = json_response
        .filter(article => article.parent_id !== 35349 && article.parent_id !== 0) // Exclude specific parent IDs
        .map(article => ({ name: article.name, id: article.id })); // Extract group IDs

    return {facualty, department};
};

fetchData()
    .then(({facualty, department}) => {
        console.log(facualty)
        console.log(department)
        console.log(facualty.length)
        console.log(department.length)
    })