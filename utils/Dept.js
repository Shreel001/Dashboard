const getGroupIDs = require('./groups');

const deptwise = async () =>{
    const deptID = await getGroupIDs()
    console.log(deptID)
}

deptwise()