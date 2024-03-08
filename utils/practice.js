const getGroupIDs = require('./groups');

const practice = async () => {
    const groups = await getGroupIDs()

    const id = groups.map(element => element.id)
    const department = groups.map(element => element.name)

    console.log(id)
    console.log(department)
}

practice()