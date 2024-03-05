const fetchData = require('./fetchData');
const getGroupIDs = require('./groups');

const deptwise = async () => {
    const deptID = await getGroupIDs();
    const Ids = deptID.map(element => ({ id: element.id, Department: element.name }));

    const promises = Ids.map(async element => {
        const data = await fetchData(element.id);
        return { data, name: element.Department };
    });

    const resolvedData = await Promise.all(promises);

    const filteredData = resolvedData.reduce((acc, item) => {
        if (item.data !== null) {
            acc[item.name] = item.data;
        }
        return acc;
    }, {});

    return filteredData;
};

module.exports = deptwise;
