const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jfqqz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run(){
    try{
       
        await client.connect();
        console.log('db connection established');
        const database = client.db('niche_products');
        const productsCollection = database.collection('airconditions');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');
        const ordersCollection = database.collection("orders");

        // home product page find 6 products
        app.get('/products', async(req,res) =>{

            const cursor = productsCollection.find({});
            const results = await cursor.toArray();
            res.json(results);


        })

        // Explore items

        app.get('/explores', async(req,res) =>{

            const cursor = productsCollection.find({});
            const results = await cursor.toArray();
            res.json(results);


        })


        // Add Product to the db

        app.post('/addProduct', async(req,res)=>{

            const addedProduct = req.body;
            const result = await productsCollection.insertOne(addedProduct);
            res.json(result);

        })

        // Add Review to the db

        app.post('/addReview', async(req,res)=>{

          const addedReview = req.body;
          const result = await reviewsCollection.insertOne(addedReview);
          res.json(result);

      })

      // Get Review data from db

        app.get('/reviews', async(req, res) => {

          const cursor = reviewsCollection.find({});
          const results = await cursor.toArray();
          res.json(results);
        })


         // user data sent to the db

         app.post('/users', async(req, res)=>{

            const user = req.body;
            const results = await usersCollection.insertOne(user);
            console.log(results);
            res.json(results);

          })

          // google SignIn data sent to the db

          app.put('/users', async(req, res)=>{

            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const results = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(results);

          })
         
          // make an admin give role in the users collection

          app.put('/users/admin', async(req, res)=>{

            const user = req.body;
            const filter = {email: user.email}
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
          })


          // specific user is admin or not checking for this get data from users collection

          app.get('/users/:email', async(req, res)=>{

            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){

              isAdmin = true;
            }

            res.json({admin: isAdmin});
          })

          

      


        //  add orders API

        app.post('/orders', async(req,res) => {
            const order = req.body;
            
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // my orders get data from db using email

    
        app.get('/orders', async(req, res) => {
          
          let query = {};
          const email = req.query.email;
          if(email){
              query = { email: email };

          }
          const cursor = ordersCollection.find(query);
          const orders = await cursor.toArray();
          res.json(orders);


        });

  // get all orders

  app.get('/orders', async (req, res) => {

    const cursor = ordersCollection.find({})
    const orders = await cursor.toArray();
    res.send(orders);
  })

  // Get All Products

  app.get('/explores', async (req, res) =>{

    const cursor = productsCollection.find({});
    const results = await cursor.toArray();
    res.send(results);

  })

  // delete products

  app.delete('/deleteOrder/:id', async(req,res) => {
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const results = await productsCollection.deleteOne(query);
    res.json(results);
})

  // delete order 

        app.delete('/deleteOrder/:id', async(req,res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const results = await ordersCollection.deleteOne(query);
          res.json(results);
      })

      // Update status of order

      app.put('/updateStatus/:id', (req, res) => {

        const id = req.params.id;
        const updatedStatus = req.body.status;
        const filter = {_id:ObjectId(id)};
        ordersCollection.updateOne(filter, {
          $set: {status:updatedStatus},
        })

        .then((result) => {
          res.send(result);
        });
      })

          }

    finally{
        // await client.close();

    }



}

run().catch(console.dir);

app.get('/', (req, res) => {
res.send('connection with niche product server!')
})

app.listen(port, () => {
console.log(` listening at http://localhost:${port}`)
})

