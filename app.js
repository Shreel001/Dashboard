require('dotenv').config()
const express = require('express');
const cors = require('cors');
const getDate = require('./getDate')

const app = express();
app.use(express.static('public'));
app.use(cors());

/* Enviroment variables */
const BASE_URL = process.env.BASE_URL
const BASIC_AUTHORIZATION_HEADER = process.env.BASIC_AUTHORIZATION_HEADER
const INSTITUTION_NAME = process.env.INSTITUTION_NAME
const GROUP_ID = process.env.GROUP_ID
const PORT = process.env.PORT;

let serverCache = null;
var xlabels = getDate();

const headers = {
    'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
    'Content-Type': 'application/json',
};

/* Function to fetch and cache data */
const fetchData = async () => {

    const [
        response_Views,
        response_Downloads,
        response_TopCountries,
        respose_total_Views,
        response_total_Downloads,
        response_Titles
    ] = await Promise.all([
        fetch(`${BASE_URL}/${INSTITUTION_NAME}/timeline/month/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`, { headers }),
        fetch(`${BASE_URL}/${INSTITUTION_NAME}/timeline/month/downloads/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`, { headers }),
        fetch(`${BASE_URL}/${INSTITUTION_NAME}/breakdown/total/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`, { headers }),
        fetch(`${BASE_URL}/${INSTITUTION_NAME}/timeline/year/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`, { headers }),
        fetch(`${BASE_URL}/${INSTITUTION_NAME}/timeline/year/downloads/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`, { headers }),
        fetch(`${BASE_URL}/${INSTITUTION_NAME}/top/views/article`, { headers })
    ]);

    const views_json = await response_Views.json();
    const downloads_json = await response_Downloads.json();
    const topCountries_json = await response_TopCountries.json();
    const totalViews_json = await respose_total_Views.json();
    const totalDownloads_json = await response_total_Downloads.json();
    const responseTitles_json = await response_Titles.json();

    /* views and downloads data over past 6 months */
    const views = Object.values(views_json.timeline);
    const downloads = Object.values(downloads_json.timeline);

    /* Total views and downloads data over past 6 months */
    const resultViews = await totalViews_json.timeline
    const resultDownloads = await totalDownloads_json.timeline

    const totalDownloads = Object.values(resultDownloads).reduce((acc, value) => acc + value, 0);
    const totalViews = Object.values(resultViews).reduce((acc, value) => acc + value, 0);

    /* Top ten countries by number of views */
    const result = topCountries_json.breakdown.total
    const countriesData = Object.entries(result)

    const data = countriesData.reduce((arr, [country, countryData]) =>{
        arr[country] = countryData.total;
        return arr
    },[])

    const entries = Object.entries(data);
    const filteredEntries = entries.filter(([key, value]) => key !== 'Unknown'); // Filtering out the Unknown dataset
    const topTen = filteredEntries.slice(0, 10);
    const topCountriesByViews = Object.fromEntries(topTen); // Top ten countries by number of views

    /* Top performing articles from institution */
    const top = await responseTitles_json.top
    const entriesTitle = Object.entries(top);
    const sortedEntries = entriesTitle.sort((a, b) => b[1] - a[1]);

    /* Constructing object to make parallel requests to make details array */
    const cache = {};
    const fetchDetails = async (entry) => {
        if (cache[entry[0]]) {
            return { title: cache[entry[0]], value: entry[1] };
        }

    const apiURL = `https://api.figshare.com/v2/articles/${entry[0]}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`;
    const article_response = await fetch(apiURL);
    const article_response_json = await article_response.json();
    const title = article_response_json.title;

    /* Caching the result */
    cache[entry[0]] = title;

    return { title, value: entry[1] };
    };

    const detailsPromises = [];

    for (const entry of sortedEntries) {
        detailsPromises.push(fetchDetails(entry));
    }

    const details = await Promise.all(detailsPromises);

    /* Combining titles and values */
    const zipped_array = (a1, a2) => a1.map((x, i) => [x, a2[i]]);
    const topPerformingArticles = zipped_array(details.map(detail => detail.title), details.map(detail => detail.value));

    var dataToCache = { views, downloads, xlabels, topCountriesByViews, totalViews, totalDownloads, topPerformingArticles };

    serverCache = {
        data: dataToCache,
        timestamp: Date.now(),
    };

    return dataToCache;
};

/* Proxy to handle requests */
app.use('/', async (req, res) => {
    /* checking for the cached data on server side */
    if (serverCache && Date.now() - serverCache.timestamp < 15 * 60 * 1000) {
        res.json(serverCache.data);
    } else {
        try {
            /* Fetch and cache data */
            var data = await fetchData();
            res.json(data);
        } catch (error) {
            console.error('Error during API request:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});