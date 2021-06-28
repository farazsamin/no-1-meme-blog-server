const express = require('express')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors')
const ObjectID = require('mongodb').ObjectID

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.11ltg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

const port = 5000

console.log(process.env.DB_USER);
app.get('/', (req, res) => {
  res.send('Hello World! Working')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


client.connect(err => {
  const blogsCollection = client.db("meme-blog").collection("blogs");
  const userCollection = client.db("meme-blog").collection("users");
  const adminCollection = client.db("meme-blog").collection("admin");
 

  app.post('/addBlog', (req, res) => {
    const blog = req.body;
    blogsCollection.insertOne(blog)
      .then(result => {
        console.log('sucess data')
        res.redirect('/')
      })
  })

  app.get('/blogs', (req, res) => {
    blogsCollection.find({})
      .toArray((err, documents) => {
        // console.log(documents)
        res.send(documents)

      })
  })

  app.delete('/delete/:id', (req, res) => {
    console.log(req.params.id)
    blogsCollection.deleteOne({ _id: ObjectID(req.params.id) })
      .then((result) => {
        console.log(result);
      })
  })

  app.get('/single-blog/:id', (req, res) => {
    blogsCollection.find({ _id: ObjectID(req.params.id) })
      .toArray((err, documents) => {
        // console.log(documents)
        res.send(documents)

      })
  })

  app.post('/user',async (req, res) => {
    // console.log(req.query.email)
    try{
      console.log(req.body.password)
      const user = await userCollection.findOne({ email: req.body.email, password : req.body.password })
      // console.log(user) 
      if(user === null){
        throw new Error("User Not Found")
        
      }
      res.status(200).send({user})
    }
    catch(err){
      console.log(err.message)
      res.status(400).send({err : err.message})
    }
    
  })

  app.post('/isAdmin', (req, res) => {
    // console.log(req.query.email)
    adminCollection.find({ email: req.body.email })
      .toArray((err, documents) => {
        // console.log(documents)
        res.send(documents.length > 0)
      })


  })
  

});


