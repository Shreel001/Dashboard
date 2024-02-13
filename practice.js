const fetchData = require('./utils/fetchData');
const getGroupIDs = require('./utils/groups');

const deptwise = async () => {
    const deptID = await getGroupIDs();

    const ID = deptID.slice(100)

    ID.forEach(element => {
        console.log(element.id)
        console.log(element.name)
    });

    // // Use map instead of forEach to map each element to a promise
    // const promises = deptID.map(element => fetchData(element));

    // // Wait for all promises to resolve
    // const data = await Promise.all(promises);

    return ID;
}

deptwise()
    .then(data => console.log(data))
    .catch(error => console.error("Error:", error));
