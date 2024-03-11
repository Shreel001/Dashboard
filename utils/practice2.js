const  getGroupIDs = require("./groups");
const fetchData = require('./fetchData');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.static('public'));
app.use(cors());

const PORT = 5000

const deptwise = async () => {
    const deptID = await getGroupIDs();

    const promises = deptID.map(async element => {
        const faculty = element.name;
        const facultyID = element.id;
        const deptData = element.departments.map(item => ({ name: item.name, id: item.id }));
        
        // Fetch data for each department asynchronously
        const fetchDataPromises = deptData.map(async department => ({
            departmentName: department.name,
            departmentData: await fetchData(department.id)
        }));
        
        // Wait for all the fetchData promises to resolve
        const fetchedData = await Promise.all(fetchDataPromises);
    
        // Filter out departments with null data
        const data = fetchedData.filter(department => department.departmentData !== null);
    
        return { faculty, facultyID, data };
    });
    
    const resolvedData = await Promise.all(promises);

    // const filteredData = resolvedData.reduce((acc, item) => {
    //     if (item.data !== null) {
    //         acc[item.name] = item.data;
    //     }
    //     return acc;
    // }, {});

    return resolvedData;
};

/* Proxy to handle requests */
app.use('/', async (req, res) => {
    const data = await deptwise()
    res.json(data)
});

app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});

// deptwise().then(data => console.log(data))