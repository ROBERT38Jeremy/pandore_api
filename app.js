const express = require('express')
const mysql = require('mysql');
const cors = require("cors");
let DBCONNECTION = require("./database/database");

const app = express()
const port = 3000

app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: true,
    })
);

app.get('/', (req, res) => {
  res.send(DBCONNECTION)
})

app.post('/api/try/connect', (req, res) => {
    console.log(req.body);
    const body = req.body
    DBCONNECTION = body;
    const connection = mysql.createConnection({
        host: body.serveur,
        user: body.user,
        password: body.pwd,
        database: body.db,
        port: body.port ?? 3306
    });

    connection.connect(err => {
        if (err) {
            console.log('connection failed')
            res.send({
                success: false,
                error: err
            })
        } else {
            console.log('connection succeed')
            res.send({
                success: true,
            })
        }
    });

    connection.end();
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})