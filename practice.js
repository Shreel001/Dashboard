const getDate = require('./utils/getDate')
const { BEARER_AUTHORIZATION_TOKEN } = require('./utils/env');

/* Fetching array of last 6 months from current date */
var xlabels = getDate();

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
} ;

const trial = async () => {

    const data = await fetch(`https://api.figshare.com/v2/articles?page=1&page_size=1000&group=35541`, { headers })
    const result = await data.json()

    return result
}

module.exports = trial;