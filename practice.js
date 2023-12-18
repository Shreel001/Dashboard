require('dotenv').config()
const express = require('express');
const cors = require('cors');
const getDate = require('./getDate')

const app = express();
app.use(express.static('public'));
app.use(cors());

var xlabels = getDate();

/* Enviroment variables */
const BASE_URL = process.env.BASE_URL
const BASIC_AUTHORIZATION_HEADER = process.env.BASIC_AUTHORIZATION_HEADER
const INSTITUTION_NAME = process.env.INSTITUTION_NAME
const PORT = process.env.PORT;

const headers = {
    'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
    'Content-Type': 'application/json',
};

const fetchData = async () => {
    const response_Titles = await fetch(`${BASE_URL}/${INSTITUTION_NAME}/top/views/article`, { headers })
    const responseTitles_json = await response_Titles.json();
    const top = await responseTitles_json.top
    const entriesTitle = Object.entries(top);
    const sortedEntries = entriesTitle.sort((a, b) => b[1] - a[1]);
    
    cache={}
    const fetchDetails = async (entry) => {
        const apiURL = `https://api.figshare.com/v2/articles/${entry[0]}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`
        const response = await fetch(apiURL)
        const json_response = await response.json()
        const title = json_response.title

    }
    
}

fetchData()
