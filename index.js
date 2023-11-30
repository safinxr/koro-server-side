const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000

// Middleware

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));







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

        // Middleware======================
        const verifyToken = (req, res, next) => {
            const token = req?.cookies?.token
            if (!token) {
                return res.status(401).send({ message: "NO token" })
            }

            jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
                if (err) {
                    return res.status(401).send({ message: "Unable to decode " })
                }
                req.user = decode.email
            })
            next()
        }

        const verifyAdmin = async (req, res, next) => {
            const email = req.user;
            const query = { email: email };
            const user = await allUsers.findOne(query);
            const isAdmin = user?.user_type === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            next();
        }



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

        app.get('/allusers', verifyToken, verifyAdmin, async (req, res) => {
            try {
                const tokenUser = req.user
                const email = req.query.email
                if (tokenUser !== email) {
                    return res.send("donst match user")
                }
                const result = await allUsers.find().toArray()
                res.send(result)

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })
        app.get('/alluserscount', async (req, res) => {
            try {
                const result = await allUsers.find().toArray()
                const count = result.length
                res.send({ count });

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })

        app.get('/alldeliveryman', verifyToken, verifyAdmin, async (req, res) => {
            try {
                const tokenUser = req.user
                const email = req.query.email
                if (tokenUser !== email) {
                    return res.send("donst match user")
                }
                const filter = { user_type: "delivery man" }
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

        app.put('/user', verifyToken, verifyAdmin, async (req, res) => {
            try {
                const tokenUser = req.user
                const email = req.query.email
                if (tokenUser !== email) {
                    return res.send("dons't match user")
                }
                const id = req.query.id                
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
        app.get('/allparcel', verifyToken, verifyAdmin, async (req, res) => {
            try {
                const tokenUser = req.user
                const email = req.query.email
                if (tokenUser !== email) {
                    return res.send("dons't match user")
                }
                const result = await bookedParcel.find().toArray()
                res.send(result)
            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while fetching');
            }
        })

        app.get('/allparcelcount', async (req, res) => {
            try {
                const result = await bookedParcel.find().toArray()
                const count = result.length
                res.send({ count });

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

        app.put('/bookedparcel', verifyToken, async (req, res) => {
            try {
                const tokenUser = req.user
                const email = req.query.email
                if (tokenUser !== email) {
                    return res.send("dons't match user")
                }
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



        app.post('/bookedparcel', verifyToken, async (req, res) => {
            try {
                const tokenUser = req.user
                const email = req.query.email
                if (tokenUser !== email) {
                    return res.send("donst match user")
                }
                const data = req.body;
                const result = await bookedParcel.insertOne(data);
                res.send(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while Posting');
            }
        })

        app.delete('/bookedparcel', verifyToken, async (req, res) => {
            try {
                const tokenUser = req.user
                const email = req.query.email
                if (tokenUser !== email) {
                    return res.send("dons't match user")
                }
                const id = req.query.id
                const result = await bookedParcel.deleteOne({ _id: new ObjectId(id) })
                res.send(result);

            }
            catch (err) {
                console.error(err);
                res.status(400).send('An error occurred while deleting');
            }

        })

        // JWT🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none'
                })
                .send({ success: true })
        })

        app.post('/logout', async (req, res) => {

            res
                .clearCookie('token', { maxAge: 0 })
                .send({ remove: true })
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