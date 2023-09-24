const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let port = 4000;
app.use(cors());


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



app.get('/', (req, res) => {
    res.send("Hello from me!!");
    console.log(`Hello from me ` + new Date() + "\n");
});

app.post('/', async (req, res) => {
    try {
        await clientConnect();
        const myDB = client.db(dbName);
        const myColl = myDB.collection(postsCollection);
        let doc = req.body;
        doc.createdAt = new Date();

        const response = await fetch(doc.thumbnail_src);
        const blob = await response.blob();
        doc.thumbnail_src = 'data:image/png;base64,' + Buffer.from(await blob.arrayBuffer()).toString('base64');

        const result = await myColl.insertOne(doc);
        res.json({ requestBody: result })
    } catch (ex) {
        console.log("Failed", ex);
    } finally {
        // Ensures that the client will close when you finish/error
        await clientClose();
    }
});

app.post('/posts/many', async (req, res) => {
    try {
        const myDB = client.db(dbName);
        const myColl = myDB.collection(postsCollection);
        let arr = req.body.filter(b => b);
        let promises = [];
        for (let i = 0; i < arr.length; i++) {
            arr[i].createdAt = new Date();
            promises.push(
                new Promise(async (resolve, reject) => {
                    try {
                        const response = await fetch(arr[i].thumbnail_src);
                        const blob = await response.blob();
                        arr[i].thumbnail_src = 'data:image/png;base64,' + Buffer.from(await blob.arrayBuffer()).toString('base64');
                        resolve(arr[i]);
                    } catch (ex) {
                        resolve(arr[i]);

                    }
                })
            )
        }
        await clientConnect();
        if (promises.length > 0) {
            Promise.all(promises).then(async (res) => {
                const result = await myColl.insertMany(arr);
                res.json({ requestBody: result })
            })
        } else {
            res.json({ requestBody: null });
        }
    } catch (ex) {
        console.log("Failed", ex);
    } finally {
        // Ensures that the client will close when you finish/error
        await clientClose();
    }
});

app.delete('/:id', async (req, res) => {
    try {
        await clientConnect();
        const myDB = client.db(dbName);
        const myColl = myDB.collection(postsCollection);
        const query = { _id: new ObjectId(req.params.id) };
        const result = await myColl.deleteOne(query);
        res.json({ requestBody: result })
    } catch (ex) {
        console.log("Failed", ex);
    } finally {
        // Ensures that the client will close when you finish/error
        await clientClose();
    }
});

app.get('/posts/all', async (req, res) => {
    try {
        await clientConnect();
        let arr = [];
        const myDB = client.db(dbName);
        const myColl = myDB.collection(postsCollection);
        let params = req.query;
        console.log(req)
        const cursor = myColl.find({}).sort({ createdAt: -1 }).skip(parseInt(params.offset)).limit(parseInt(params.limit));

        // Print returned documents
        for await (const post of cursor) {
            arr.push(post);
        }
        res.json(arr)
    } catch (ex) {
        console.log("Failed", ex);
    } finally {
        // Ensures that the client will close when you finish/error
        await clientClose();
    }
});
app.put('/posts', async (req, res) => {
    try {
        await clientConnect();
        // Get the "movies" collection in the "sample_mflix" database
        const database = client.db(dbName);
        const posts = database.collection(postsCollection);
        // Create a filter to update all movies with a 'G' rating
        const filter = {};
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
        await clientClose();
    }
});

async function clientConnect() {
    return new Promise(async (resolve, reject) => {
        await client.connect();
        resolve(true);
    })
}

function clientClose() {
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            await client.close();
            resolve(true);
        }, 1500)
    })
}

app.listen(port, () => console.log(`Server listening on port ${port}!`));
module.exports = { app }
