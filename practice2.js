const trial = require("./practice");
const { BEARER_AUTHORIZATION_TOKEN } = require('./utils/env');

/* Authorization header */
const headers = {
    'Authorization': `Bearer ${BEARER_AUTHORIZATION_TOKEN}`,
    'Content-Type': 'application/json',
};

const data = async () => {
    const response = await trial();
    console.log(response)
    let temp = [];

    await Promise.all(response.map(async element => {
        const id = element.id;
        const group_id = element.group_id;
        const url = element.url_public_html;

        const authorsResponse = await fetch(`https://api.figshare.com/v2/account/articles/${id}/authors`, { headers });
        const authorsData = await authorsResponse.json();

        const authors = authorsData.map(author => author.full_name);

        temp.push({ id: id, group_id: group_id, hyperlink: url, authors: authors });
    }));

    return temp;
};

data()