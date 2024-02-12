require('dotenv').config()

/* Enviroment variables */
const envVariables = {
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    BASIC_AUTHORIZATION_HEADER: process.env.BASIC_AUTHORIZATION_HEADER,
    BEARER_AUTHORIZATION_TOKEN: process.env.BEARER_AUTHORIZATION_TOKEN,
    INSTITUTION_NAME: process.env.INSTITUTION_NAME,
    GROUP_ID: process.env.GROUP_ID
};

module.exports = envVariables;