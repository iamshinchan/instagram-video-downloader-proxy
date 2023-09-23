const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json())  

const dbName = "instagram_posts";
const postsCollection = "posts";

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
        const myDB = client.db(dbName);
        const myColl = myDB.collection(postsCollection);
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

app.get('/posts/all', async (req, res) => {
    try {
        await client.connect();
        let arr =[];
        const myDB = client.db(dbName);
        const myColl = myDB.collection(postsCollection);
        const cursor = myColl.find({});

        // Print returned documents
        for await (const post of cursor) {
            arr.push(post);
        }
        res.json(arr)
    } catch (ex) {
        console.log("Failed", ex);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});
app.put('/posts', async (req, res) => {
    try {
        await client.connect();
        // Get the "movies" collection in the "sample_mflix" database
        const database = client.db(dbName);
        const posts = database.collection(postsCollection);
        // Create a filter to update all movies with a 'G' rating
        const filter = { };
        // Create an update document specifying the change to make
        let doc = req.body;
        const updateDoc = {
            $set: doc,
        };
        // Update the documents that match the specified filter
        const result = await posts.updateMany(filter, updateDoc);
        res.json(result)
    } catch (ex) {
        console.log("Failed", ex);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

module.exports = { app }
