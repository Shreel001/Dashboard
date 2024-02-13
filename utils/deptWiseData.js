const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');

let Ids=[];

const deptwise = async () => {
    const deptID = await getGroupIDs();

    deptID.forEach(element => {
        Ids.push(element.id)
    });

    // Use map instead of forEach to map each element to a promise
    const promises = Ids.map(element => fetchData(element));

    // Wait for all promises to resolve
    const data = await Promise.all(promises);

    const filteredData = data.filter(item => item !== null);

    return filteredData;
}

deptwise()
    .then(data => console.log(data))

module.exports = deptwise;