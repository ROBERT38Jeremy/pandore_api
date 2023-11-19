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

app.get('/api/database/:database/data', (req, res) => {
    const connection = mysql.createConnection({
        host: DBCONNECTION.serveur ?? 'localhost',
        user: DBCONNECTION.user ?? 'root',
        password: DBCONNECTION.pwd ?? 'root',
        database: 'information_schema',
        port: DBCONNECTION.port ?? 3306
    });

    connection.connect(err => {
        if (!err) {
            connection.query("SELECT * FROM `TABLES` WHERE `TABLE_SCHEMA` = ?;", [ req.params.database ], (err, result, fields) => {
                if (err) {
                    connection.end();
                    return res.send({
                        success: false,
                        error: err
                    })
                }
                return res.send({
                    success: result
                })
            })
        } else {
            connection.end();
            return res.send({
                success: false,
                error: err
            })
        }
    });
})

app.get('/api/database/list', (req, res) => {
    const connection = mysql.createConnection({
        host: DBCONNECTION.serveur ?? 'localhost',
        user: DBCONNECTION.user ?? 'root',
        password: DBCONNECTION.pwd ?? 'root',
        port: DBCONNECTION.port ?? 3306
    });
    const disabledDatabase = ['information_schema', 'mysql', 'performance_schema', 'sys'];

    connection.connect(err => {
        if (!err) {
            connection.query("SHOW DATABASES;", (err, result, fields) => {
                if (err) {
                    connection.end();
                    return res.send({
                        success: false,
                        error: err
                    })
                }

                return res.send({
                    success: result
                        .filter((databaseName) => {
                            return !disabledDatabase.includes(databaseName.Database)
                        })
                        .map((databaseName) => {
                            return databaseName.Database
                        })
                })
            })
        } else {
            connection.end();
            return res.send({
                success: false,
                error: err
            })
        }
    });
})

app.get('/api/database/:databaseName/:tableName/structure', (req, res) => {
    const { params } = req

    const connection = mysql.createConnection({
        host: DBCONNECTION.serveur ?? 'localhost',
        user: DBCONNECTION.user ?? 'root',
        password: DBCONNECTION.pwd ?? 'root',
        database: params.databaseName,
        port: DBCONNECTION.port ?? 3306
    });

    connection.connect(err => {
        if (!err) {
            connection.query("DESCRIBE " + params.tableName, (err, result, fields) => {
                if (err) {
                    connection.end();
                    return res.send({
                        success: false,
                        error: err
                    })
                }

                return res.send({
                    success: result
                })
            })
        } else {
            connection.end();
            return res.send({
                success: false,
                error: err
            })
        }
    });
})

app.get('/api/database/:databaseName/:tableName/datas', (req, res) => {
    const { params } = req
    const conf = req.body

    const connection = mysql.createConnection({
        host: DBCONNECTION.serveur ?? 'localhost',
        user: DBCONNECTION.user ?? 'root',
        password: DBCONNECTION.pwd ?? 'root',
        database: params.databaseName,
        port: DBCONNECTION.port ?? 3306
    });

    // contruction de la requête
    let request = "SELECT *\nFROM " + params.tableName + "";
    let bindings = [];

    if (conf?.limit && conf?.limit !== 'all') {
        request += "\nLIMIT ?"
        bindings.push(conf.limit)
    } else {
        request += "\nLIMIT 50"
    }

    connection.connect(err => {
        if (!err) {
            connection.query(request, bindings, (err, result, fields) => {
                if (err) {
                    connection.end();
                    return res.send({
                        success: false,
                        error: err
                    })
                }

                return res.send({
                    request: request,
                    success: result,
                })
            })
        } else {
            connection.end();
            return res.send({
                success: false,
                error: err
            })
        }
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})