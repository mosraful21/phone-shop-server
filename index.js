const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntn7mgs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const productMarketingCollection = client.db('productMarketing').collection('products');
    const usersCollection = client.db('productMarketing').collection('users');
    const bookingsCollection = client.db('productMarketing').collection('bookings');

    // Product data load ----------------------------------
    app.get('/products', async (req, res) => {
      const query = {};
      const options = await productMarketingCollection.find(query).toArray();
      res.send(options);
    });

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productMarketingCollection.findOne(query);
      res.send(result);
    });

    // set user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // get users
    app.get('/users', async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

  }
  finally {

  }
}
run().catch(console.log)




app.get('/', async (req, res) => {
  res.send('Product marketing server running on server')
})
app.listen(port, () => {
  console.log("Product marketing running on port ", port);
})