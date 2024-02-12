const getDate = require('./getDate')
const { BASE_URL, INSTITUTION_NAME, GROUP_ID } = require('./env');

/* Fetching array of last 6 months from current date */
var xlabels = getDate();

const apiEndpoints = {
    viewsData: `${BASE_URL}/${INSTITUTION_NAME}/timeline/month/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`,
    downloadData: `${BASE_URL}/${INSTITUTION_NAME}/timeline/month/downloads/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`,
    topCountries: `${BASE_URL}/${INSTITUTION_NAME}/breakdown/total/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`,
    totalView: `${BASE_URL}/${INSTITUTION_NAME}/timeline/year/views/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`,
    totalDownload: `${BASE_URL}/${INSTITUTION_NAME}/timeline/year/downloads/group/${GROUP_ID}?start_date=${xlabels[0]}-01&end_date=${xlabels[5]}-28`,
    titles: `https://api.figshare.com/v2/articles?page=1&page_size=1000&group=${GROUP_ID}`
};

module.exports = apiEndpoints;