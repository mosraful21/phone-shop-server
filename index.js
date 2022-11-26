const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port =  process.env.PORT || 5000;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntn7mgs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const productMarketingCollection = client.db('productMarketing').collection('products');
        const usersCollection = client.db('productMarketing').collection('users');

        // Product data load ----------------------------------
        app.get('/products', async(req, res) => {
            const query = {};
            const options = await productMarketingCollection.find(query).toArray();
            res.send(options);
        });

        app.get('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productMarketingCollection.findOne(query);
            res.send(result);
        });

        // Users Data load --------------------------------------------
        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        
    }
    finally{

    }
}
run().catch(console.log)




app.get('/', async (req, res) => {
    res.send('Product marketing server running on server')
})
app.listen(port , () => {
    console.log("Product marketing running on port ", port);
})