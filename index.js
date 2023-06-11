const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config()


// middleware
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-onjpk5k-shard-00-00.xskcn3u.mongodb.net:27017,ac-onjpk5k-shard-00-01.xskcn3u.mongodb.net:27017,ac-onjpk5k-shard-00-02.xskcn3u.mongodb.net:27017/?ssl=true&replicaSet=atlas-g07jbs-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("summerCampDb").collection('users')
    const classesCollection = client.db("summerCampDb").collection('classes')

  //  class related api 
   app.post('/allClasses',async(req,res)=> {

    
   })
   
   
   
   
    // user api

    app.get('/users', async(req,res)=> {
        const result = await usersCollection.find().toArray()
        res.send(result)
    })

    // get all instructor api 

    app.get('/allInstructor', async(req,res)=> {
      
        const query = { role : "Instructor"}
        const result = await usersCollection.find(query).toArray()
        res.send(result)
    })



    // delete user api 

    app.delete('/users/:id', async(req,res)=>{
        const id = req.params.id 
        const query = {_id : new ObjectId(id)}
        const result = await usersCollection.deleteOne(query)
        res.send(result)
    })


  
    // admin role api  
    app.patch('/users/admin/:id', async(req,res)=>{
        const id = req.params.id 
        const filter = {_id : new ObjectId(id)}
        const updateDoc = {
          $set : {
            role : 'admin',
          },
        }
     
        const result = await usersCollection.updateOne(filter,updateDoc)
        res.send(result)
      })
      
    //   make Instructor role api

      app.patch('/users/Instructor/:id', async(req,res)=>{
        const id = req.params.id 
        const filter = {_id : new ObjectId(id)}
        const updateDoc = {
          $set : {
            role : 'Instructor',
          },
        }
     
        const result = await usersCollection.updateOne(filter,updateDoc)
        res.send(result)
      })
   
   
    // check admin api 
    app.get('/users/admin/:email',async(req,res)=> {
    const email = req.params.email 
    const query = {email : email}
    const user = usersCollection.findOne(query)
    const result = {admin : user?.role ===  'admin'}
    res.send(result)

    })
   
    app.get('/users/Instructor/:email',async(req,res)=> {
    const email = req.params.email 
    const query = {email : email}
    const user = usersCollection.findOne(query)
    const result = {instructor : user?.role ===  'Instructor'}
    res.send(result)

    })
    



   
   
   
   
   
   
    app.post('/users', async(req,res)=>{
        const user = req.body 
        console.log(user)
  
        const query = {email : user.email}
        const exitingUser = await usersCollection.findOne(query)
  
        if(exitingUser){
          return res.send({message : 'user already exists'})
        }
       const result = await usersCollection.insertOne(user)
        res.send(result)
      })
  
  
  
  
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req,res)=> {
    res.send('summer camp  is running')
})

app.listen(port, ()=>{
     console.log(`summer camp is running on port : ${port} `)
})