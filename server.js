const express = require('express');

const app = express();
const PORT = 3001;

app.use('/', async (req, res) => {

    const apiEndpoint_title = `https://stats.figshare.com/top/views/article`

    const response = await fetch(apiEndpoint_title)
    const json = await response.json()
    const result = json.top
    
    res.json({result})
})

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});