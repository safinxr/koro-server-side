const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        await client.connect();

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


        // BOOKED PARCEL==============================
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


        console.log("Koro connected to mongodb✅✅✅✅✅✅✅✅");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    console.log(alu);
    res.send("KORO Running")
})

app.listen(port)