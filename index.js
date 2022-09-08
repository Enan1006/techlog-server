require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Techlog server is running');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejpclfg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("techlog").collection("productCollection");
        const userCollection = client.db("techlog").collection("users");
        const reviewCollection = client.db("techlog").collection("reviews");

        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        app.get('/feature-products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query).limit(6);
            const result = await cursor.toArray();
            res.send(result)
        });

        app.get('/product/:categoryId', async (req, res) => {
            const category = req.params.categoryId;
            const query = { category: category };
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        app.put('/users/:email', async (req, res) => {

            const email = req.params.email;
            const user = req.body;
            console.log(user);
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ result, token })
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await userCollection.findOne(filter);
            res.send(result)
        });
        app.patch('/users/:email', async (req, res) => {

            const email = req.params.email;
            const user = req.body;
            console.log(user);
            console.log(user);
            const filter = {
                email: email
            };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
        });

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            const info = req.body;
            const doc = {
                name: info.name,
                email: info.email,
                rating: info.rating,
                message: info.message,
            };
            const result = await reviewCollection.insertOne(doc);
            res.send(result)
        });
    }
    finally { }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`App is  running on port ${port}`)
})