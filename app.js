require('dotenv').config()
const express = require('express');
const cors = require('cors');
const getDate = require('./getDate')

const app = express();
const PORT = process.env.PORT || 3000;

//Enviroment variables
const BASE_URL = process.env.BASE_URL
const BASIC_AUTHORIZATION_HEADER = process.env.BASIC_AUTHORIZATION_HEADER
const INSTITUTION_NAME = process.env.INSTITUTION_NAME
const GROUP_ID = process.env.GROUP_ID

app.use(express.static('public'));
app.use(cors());

app.use('/', async (req, res) => {
    
    var xlabels = getDate();

    try{

        //Bar chart data of views and downloads over past 6 months
        const apiEndpoint_downloads = `${BASE_URL}/${INSTITUTION_NAME}/timeline/month/downloads/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`;
        const apiEndpoint_views = `${BASE_URL}/${INSTITUTION_NAME}/timeline/month/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`;
        
        //Country wise data of views over past 6 months
        const apiEndpoint_topCountries = `${BASE_URL}/${INSTITUTION_NAME}/breakdown/total/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`
        
        //Total views and download data over past 6 months
        const apiEndpoint_total_views =  `${BASE_URL}/${INSTITUTION_NAME}/timeline/year/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`
        const apiEndpoint_total_downloads =  `${BASE_URL}/${INSTITUTION_NAME}/timeline/year/downloads/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`

        //Fetching top performing article 
        const apiEndpoint_title = `${BASE_URL}/${INSTITUTION_NAME}/top/views/article`
        
        const headers = {
            'Authorization': `Basic ${BASIC_AUTHORIZATION_HEADER}`,
            'Content-Type': 'application/json',
        };

        // Fetching views data over past 6 months
        const responseViews = await fetch(apiEndpoint_views, { headers });
        const dataViews = await responseViews.json();
        const views = Object.values(dataViews.timeline);

        // Fetching downloads data over past 6 months
        const responseDownloads = await fetch(apiEndpoint_downloads, { headers });
        const dataDownloads = await responseDownloads.json();
        const downloads = Object.values(dataDownloads.timeline);

        // Fetching data for top ten views from different countries
        const response = await fetch(apiEndpoint_topCountries, { headers })
        const json_response = await response.json()
        const result = json_response.breakdown.total

        const countriesData = Object.entries(result)

        // Creating final dataset
        const data = countriesData.reduce((arr, [country, countryData]) =>{
            arr[country] = countryData.total;
            return arr
        },[])

        const entries = Object.entries(data);

        // Filtering out the Unknown dataset
        const filteredEntries = entries.filter(([key, value]) => key !== 'Unknown');

        // // Slice the array to get the first ten entries
        const topTen = filteredEntries.slice(0, 10);

        // // Convert back to an object if needed
        const countryDatabyViews = Object.fromEntries(topTen);

        // fetch views over last 6 months 
        const totalViews = await fetch(apiEndpoint_total_views, { headers })
        const totalViews_data = await totalViews.json()
        const resultViews = await totalViews_data.timeline

        // fetch downloads over last 6 months
        const totalDownloads = await fetch(apiEndpoint_total_downloads, { headers })
        const totalDownloads_data = await totalDownloads.json()
        const resultDownloads = await totalDownloads_data.timeline

        // Calculate total views and downloads over 6 months
        const Total_downloads = Object.values(resultDownloads).reduce((acc, value) => acc + value, 0);
        const Total_views = Object.values(resultViews).reduce((acc, value) => acc + value, 0);

        //
        const responseTitles = await fetch(apiEndpoint_title, { headers })
        const responseTitles_json = await responseTitles.json()
        const resultTitle = responseTitles_json.top

        const entriesTitle = Object.entries(resultTitle);
    
        // Sort the array based on values in descending order
        const sortedEntries = entriesTitle.sort((a, b) => b[1] - a[1]);

        const values = []

        for (let i=0; i<10; i++){
            values.push(sortedEntries[i][1])
        }

        title_list = []

        for(let i=0; i<10; i++){

            const apiURL = `https://api.figshare.com/v2/articles/${sortedEntries[i][0]}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`
            const article_response = await fetch(apiURL) 
            const article_response_json = await article_response.json()
            const title = article_response_json.title
            title_list.push(title)
        }

        let zipped_array = (a1, a2) => a1.map((x, i) => [x, a2[i]]);
        const titles = zipped_array(title_list, values)

        res.json({ views, downloads, xlabels, countryDatabyViews, Total_views, Total_downloads, titles});
    }catch(error) {
        console.error('Error during API request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});