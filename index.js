const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY);

// middleware
app.use(cors())
app.use(express.json())
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-onjpk5k-shard-00-00.xskcn3u.mongodb.net:27017,ac-onjpk5k-shard-00-01.xskcn3u.mongodb.net:27017,ac-onjpk5k-shard-00-02.xskcn3u.mongodb.net:27017/?ssl=true&replicaSet=atlas-g07jbs-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");

  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect()




    const usersCollection = client.db("summerCampDb").collection('users')
    const classesCollection = client.db("summerCampDb").collection('classes')
    const selectedClassCollection = client.db("summerCampDb").collection('selectedClasses')
    const paymentCollection = client.db("summerCampDb").collection('payment')
  
    app.get('/', (req,res)=> {
      res.send('summer camp  is running')
  })



  //  class related api 
   app.post('/allClasses',async(req,res)=> {
    const classes =  req.body 
    const result = await classesCollection.insertOne(classes)
    res.send(result)
})

app.get('/classes', async(req,res)=> {
  const result = await classesCollection.find().toArray()
  res.send(result)
})

// instructor my class api
app.get('/myClass/:email',async(req,res)=> {
  const email = req.params.email 
  const query = {email : email}
  const result = await classesCollection.find(query).toArray()
  res.send(result)
})





// getting single class for payment
app.get('/selectedClass/:id', async(req,res)=> {

   const id = req.params.id
    const query = {_id : new ObjectId(id)}
    const result = await selectedClassCollection.findOne(query)
    res.send(result)

})




// selected class related api 
app.post('/selectedClass/:id', async (req, res) => {
  const selectedClass = req.body;
  delete selectedClass._id
  const id = req.params.id;
   const result = await selectedClassCollection.insertOne({  classId:id, ...selectedClass });
  res.send(result);
});

app.get('/selectedClass', async(req,res)=> {
  const result = await selectedClassCollection.find().toArray()
  res.send(result)
})

app.delete('/selectedClass/:id', async(req,res)=> {

        const id = req.params.id
        console.log(id)
        
        const query = {_id : new ObjectId(id)}
        const result = await selectedClassCollection.deleteOne(query)
        console.log(result)
        res.send(result)

})





// popular class section api 

  app.get('/popularClass', async(req,res) => {

    const result = await classesCollection.find().sort({'enrolled' : -1}).limit(6).toArray()
    res.send(result)


  })

  // here is student enrolled classes get api 

  app.get('/enrolledClass/:email', async(req,res)=> {
    const email = req.params.email
    const query = {email : email}


    const result = await paymentCollection.find(query).sort({'price' : -1}).toArray()
    res.send(result)
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
    // get popular instructor

    app.get('/popularInstructor', async(req,res)=> {
      const query = { role : "Instructor"}
        const result = await usersCollection.find(query).limit(6).toArray()
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
    const user = await usersCollection.findOne(query)
    const result = {admin : user?.role ===  'admin'}
    res.send(result)

    })
   
    app.get('/users/Instructor/:email',async(req,res)=> {
    const email = req.params.email 
    const query = {email : email}
    const user = await usersCollection.findOne(query)
    
    const result = {instructor : user?.role ===  'Instructor'}
    res.send(result)

    })
    



   
   
   
   
   
   
    app.post('/users', async(req,res)=>{
        const user = req.body 
        
  
        const query = {email : user.email}
        const exitingUser = await usersCollection.findOne(query)
  
        if(exitingUser){
          return res.send({message : 'user already exists'})
        }
       const result = await usersCollection.insertOne(user)
        res.send(result)
      })

      // PAYMENT GATEWAY API  

      app.post('/create-payment-intent', async(req,res)=> {
        try{
          const {price} = req.body
        console.log(req.body)
        const amount = price*100
        const paymentIntent = await stripe.paymentIntents.create({
          amount : amount,
          currency : 'usd',
          payment_method_types : ['card'],
        })
    
    
        res.send({
          clientSecret : paymentIntent.client_secret
        })
        
      }catch(error){
        res.send({error})
      }
    })

    // payment related api 

  app.post('/payment', async(req,res)=> {
    const payment = req.body 
    const inserterResult = await paymentCollection.insertOne(payment)
    const  enrolled = payment.enrolled;
    console.log(enrolled)
    // const available_seatsId = payment.available_seats
   const updatedResult = await classesCollection.updateOne({ _id: new ObjectId(enrolled)}, { $inc: { available_seats: -1,  enrolled :1}});
 
   res.send({inserterResult,updatedResult})
  })







app.listen(port, ()=>{
     console.log(`summer camp is running on port : ${port} `)
})