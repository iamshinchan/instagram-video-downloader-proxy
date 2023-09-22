const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json())  

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://instagramposts:SkEjLzNGYbyIeVML@cluster0.4i6kgu3.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


let port = 4000;
app.use(cors());

app.get('/', (req, res) => {
    res.send("Hello from me!!");
    console.log(`Hello from me ` + new Date() + "\n");
});

app.post('/', async (req, res) => {
    try {
        await client.connect();
        const myDB = client.db("instagram_posts");
        const myColl = myDB.collection("posts");
        let doc = req.body;
        doc.createdAt = new Date();
        const result = await myColl.insertOne(doc);
        res.json({ requestBody: result })
    } catch (ex) {
        console.log("Failed", ex);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

app.listen(port, () => console.log(`Proxy server listening on port ${port}!`));

module.exports = { app }
