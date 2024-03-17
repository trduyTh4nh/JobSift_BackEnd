
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
// const post = require('./post');
// const userRouter = require('./router/user');
const pgp = require('pg-promise')();

const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'JobSift_v1',
    user: 'postgres',
    password: '1234',
})

// app.use(express.json());
// app.use('/user', userRouter);
// app.use(bodyParser.json())

// app.use(bodyParser.text({
//     type: 'text/plain'
// // }));

// app.use(bodyParser.urlencoded({ extended: false }))


app.post("/adduser", async (req, res) => {
   
    const { email, password, phone, full_name, profile_picture, diamond_count } = req.body;
    console.log("DATA" + req.body)


    console.log("Test 1 " + req.body["email"] + ' ' + req.body["password"] + ' ' + req.body["phone"])
    console.log("Test 5 " + req.body.email + ' ' + req.body.password + ' ' + req.body.phone)


    const insertQR = `
    INSERT INTO "users" (email, password, phone, full_name, profile_picture, diamond_count)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;


    db.none(insertQR, [email, password, phone, full_name, profile_picture,  0])
        .then(() => {
         

            res.status(200).json(req.body);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        })
});
