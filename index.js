const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sntgfkl.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const allUsers = client.db("koroDB").collection("allUsers");
        const bookedParcel = client.db("koroDB").collection("bookedParcel");

        // USER DB========================================= USER DB //
        app.get('/user', async (req, res) => {
            try {
                const email = req.query.email
                const query = { email: email };
                const result = await allUsers.findOne(query);
                res.send(result)

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })

        app.get('/allusers', async (req, res) => {
            try {
                const email = req.query.email                
                const result = await allUsers.find().toArray()
                res.send(result)

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })

        app.get('/alldeliveryman', async (req, res) => {
            try {
                const email = req.query.email
                const filter = {user_type: "delivery man"}                
                const result = await allUsers.find(filter).toArray()
                res.send(result)

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })

        app.post('/users', async (req, res) => {
            try {
                const data = req.body;
                data.user_type = "user"
                const resultOne = await allUsers
                    .find({ email: data.email })
                    .toArray()
                if (resultOne.length > 0) {
                    res.send("409 user already exists ")
                }
                else {
                    const resultTwo = await allUsers.insertOne(data);
                    res.send(resultTwo);
                }
            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while Posting');
            }
        })

        app.put('/user', async (req, res) => {
            try {
                const id = req.query.id
                const email = req.query.email
                const data = req.body
                console.log(id, email, data); 
                const filter = { _id: new ObjectId(id) };
                const newData = {
                    $set: data
                };
                const result = await allUsers.updateOne(filter, newData);
                res.send(result);

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while updating');
            }

        })


        // BOOKED PARCEL==============================
        app.get('/allparcel', async (req, res) => {
            try { 
                // const email = req.query.email;
                const result = await bookedParcel.find().toArray()
                res.send(result)
            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })

        app.get('/bookedparcel', async (req, res) => {
            try {
                const email = req.query.email
                const query = { email: email };
                const result = await bookedParcel.find(query).toArray()
                res.send(result)

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })

        app.get('/singleparcel', async (req, res) => {
            try {
                const id = req.query.id
                // const email = req.query.email;
                const result = await bookedParcel.findOne({ _id: new ObjectId(id) })
                res.send(result);

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }

        })

        app.put('/bookedparcel', async (req, res) => {
            try {
                const id = req.query.id
                const data = req.body
                const filter = { _id: new ObjectId(id) };
                const newData = {
                    $set: data
                };
                const result = await bookedParcel.updateOne(filter, newData);
                res.send(result);

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while updating');
            }

        })
        


        app.post('/bookedparcel', async (req, res) => {
            try {
                const data = req.body;
                const result = await bookedParcel.insertOne(data);
                res.send(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while Posting');
            }
        })

        app.delete('/bookedparcel', async (req, res) => {
            try {
                const id = req.query.id
                const result = await bookedParcel.deleteOne({ _id: new ObjectId(id) })
                res.send(result);

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while deleting');
            }

        })


        console.log("Koro connected to mongodb✅✅✅✅✅✅✅✅");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("KORO Running")
})

app.listen(port)