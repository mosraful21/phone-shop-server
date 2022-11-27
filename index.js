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
    const wishListCollection = client.db('productMarketing').collection('wishlist');

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


    // bookings from users
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const query = {
        BuyerName: booking.name,
        email: booking.email,
        phone: booking.phone,
        productName: booking.productName,
        resalePrice: booking.resalePrice,
        location: booking.location,
      }
      const Booked = await bookingsCollection.find(query).toArray();
      if (Booked.length) {
        const message = `You Already buy this ${booking.productName}`
        return res.send({ acknowledge: false, message });
      }
      const result = await bookingsCollection.insertOne(booking);
      res.send(result)
    });
    app.get('/bookings', async (req, res) => {
      const email = req.query.email;

      // const decodeEmail = req.decoded.email;
      // if (email !== decodeEmail) {
      //   return res.status(403).send({ message: 'forbidden access' });
      // }

      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    })

    //   wish list
    app.post('/wishlist', async (req, res) => {
      const wishlist = req.body;
      const query = {
        name: wishlist.name,
        email: wishlist.email,
        productName: wishlist.productName,
        resalePrice: wishlist.resalePrice,
        originalPrice: wishlist.originalPrice
      }
      const result = await wishListCollection.insertOne(query);
      res.send(result)
    });
    app.get('/wishlist', async (req, res) => {
      const email = req.query.email;
      // const decodeEmail = req.decoded.email;
      // if (email !== decodeEmail) {
      //   return res.status(403).send({ message: 'forbidden access' });
      // }

      const query = { email: email };
      const wishlist = await wishListCollection.find(query).toArray();
      res.send(wishlist);
    })

    //   jwt
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
        return res.send({ accessToken: token })
      }
      res.status(403).send({ accessToken: '' })

    })

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