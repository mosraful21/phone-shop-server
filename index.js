const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntn7mgs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verify jwt 
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Unauthorized Access');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
  })
}


async function run() {
  try {
    const productMarketingCollection = client.db('productMarketing').collection('products');
    const usersCollection = client.db('productMarketing').collection('users');
    const bookingsCollection = client.db('productMarketing').collection('bookings');
    const wishListCollection = client.db('productMarketing').collection('wishlist');
    const sellerProductsCollection = client.db('productMarketing').collection('SellerProduct');
    const advertiseCollection = client.db('productMarketing').collection('advertised');

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
      const Booked = await bookingsCollection.find(booking).toArray();
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

    //delete user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

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
        const wish = await wishListCollection.find(query).toArray();
        if (wish.length) {
          const message = `You Already added this on WishList`
          return res.send({ acknowledge: false, message });
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

    // add advertise items
    app.post('/advertise', async (req, res) => {
      const wishlist = req.body;
      const advertise = await advertiseCollection.find(wishlist).toArray();
      if (advertise.length) {
        const message = `You Already added this on advertised`
        return res.send({ acknowledge: false, message });
      }
      const result = await advertiseCollection.insertOne(wishlist);
      res.send(result)
    });
    app.get('/advertise/:email', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const advertise = await advertiseCollection.find(query).toArray();
      res.send(advertise);
    })
     // delete advertised
     app.delete("/advertise/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await advertiseCollection.deleteOne(filter);
      res.send(result);
    });
    

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

    });


    // check a user is a admin or not
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
  })
  // check a user is a seller or not
    app.get('/users/seller/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.status === 'Seller' });
  })
  // check a user is a buyer or not
    app.get('/users/buyer/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.status === 'User' });
  })
     // save product
     app.post("/addproduct", async (req, res) => {
      const product = req.body;
      const result = await sellerProductsCollection.insertOne(product);
      res.send(result);
    });

    // get my products api
    app.get("/myproducts/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const result = await sellerProductsCollection.find(filter).toArray();
      res.send(result);
    });

     // delete product
     app.delete("/myproducts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await sellerProductsCollection.deleteOne(filter);
      res.send(result);
    });
     // delete user
     app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
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