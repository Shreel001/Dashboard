const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');

let Ids=[];

const deptwise = async () => {
    const deptID = await getGroupIDs();

    deptID.forEach(element => {
        Ids.push({id: element.id, Department: element.name})
    });

    // Use map instead of forEach to map each element to a promise
    const promises = Ids.map(element => fetchData(element.id));

    // Wait for all promises to resolve
    const data = await Promise.all(promises);

    const filteredData = data.filter(item => item !== null);

    return {filteredData};
}

module.exports = deptwise;