const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const fetch = require('node-fetch');

let port = 4000;
app.use(cors());

app.get('/proxy', (req, res) => {
    const fileUrl = req.query.url; // Get the URL from the query parameter
    const fileName = req.query.fileName; // Extract the filename from the URL
    console.log(fileUrl)
    axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    })
        .then((response) => {
            res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-type', response.headers['content-type']);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

            response.data.pipe(res);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Server error');
        });
});

app.get('/graphql/query', (req, res) => {
    let proxyUrl = 'https://www.instagram.com';
    fetch(proxyUrl + req.originalUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Referer": proxyUrl,
            "Origin": proxyUrl
        }
    })
        .then(response => response.json())
        .then(json => res.json(json))
        .catch(error => res.status(500).json({ error: error.message }));
});

app.listen(port, () => console.log(`Proxy server listening on port ${port}!`));

module.exports = { app }
