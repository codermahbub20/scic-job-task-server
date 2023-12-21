require('dotenv').config();
const express = require('express')
const app = express()

const { MongoClient, ServerApiVersion } = require('mongodb');

const jwt = require('jsonwebtoken')
const cors = require('cors');


app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rarr4yf.mongodb.net/?retryWrites=true&w=majority`;


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
        // await client.connect();
        // Send a ping to confirm a successful connection


        const usersCollection = client.db("scic1").collection("users")




        // jwt related apis
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })


        // users related api 
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            const options = { upsert: true }
            const isExist = await usersCollection.findOne(query)
            console.log('User found?----->', isExist)
            if (isExist) return res.send(isExist)
            const result = await usersCollection.updateOne(
                query,
                {
                    $set: { ...user, timestamp: Date.now() },
                },
                options
            )
            res.send(result)
        })


        // app.get('/users/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const result = await usersCollection.findOne({ email })

        //     res.send(result)
        // })

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()

            res.send(result)
        })




        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello ! Welcome to scic job task')
})

app.listen(port, () => {
    console.log(`Scic Job Task listening on port ${port}`)
})