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
const BEARER_AUTHORIZATION_TOKEN = process.env.BEARER_AUTHORIZATION_TOKEN
const INSTITUTION_NAME = process.env.INSTITUTION_NAME
const GROUP_ID = process.env.GROUP_ID
const PORT = process.env.PORT

let serverCache = null;
var xlabels = getDate();

/* Authorization header */
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
        fetch(`https://api.figshare.com/v2/articles?page=1&page_size=1000&group=${GROUP_ID}`, 
        {
            'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
            'Content-Type': 'application/json',
        } )
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
    
    responseTitles_json.map(article => ({
        id: article.id,
        title: article.title,
    }))

    const promises = responseTitles_json.map(async (element) => {
        const { id, title } = element;

        const response = await fetch(`${BASE_URL}/${INSTITUTION_NAME}/total/views/article/${id}`);
        
        if (!response.ok) {
            console.error(`Failed to fetch data for ID ${id}: ${response.statusText}`);
            return { title, views: 0 };
        }

        const responseData = await response.json();
        const totalViews = responseData.totals;

        return { title, views: totalViews };
    });

    const results = await Promise.all(promises);

    results.sort((a, b) => b.views - a.views);

    const topTenData = results.slice(0, 10);

    // // Simplify the structure if needed
    const topPerforming = topTenData.map(item => ({
        title: item.title,
        views: item.views,
    }));

    var dataToCache = { views, downloads, xlabels, topCountriesByViews, totalViews, totalDownloads, topPerforming };

    serverCache = {
        data: dataToCache,
        timestamp: Date.now(),
    };

    return dataToCache;
}

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