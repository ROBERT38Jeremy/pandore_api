const express = require('express')
const mysql = require('mysql');
const cors = require("cors");
let DBCONNECTION = require("./database/database");

const app = express()
const port = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
            res.send({
                success: false,
                error: err
            })
        } else {
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

app.post('/api/database/:databaseName/:tableName/datas', (req, res) => {
    const { params } = req
    const conf = req.body

    const connection = mysql.createConnection({
        host: DBCONNECTION.serveur ?? 'localhost',
        user: DBCONNECTION.user ?? 'root',
        password: DBCONNECTION.pwd ?? 'root',
        database: params.databaseName,
        port: DBCONNECTION.port ?? 3306,
        dateStrings: 'date'
    });

    // contruction de la requête
    let request = "SELECT * FROM " + params.tableName + " WHERE 1";
    let bindings = [];

    if (conf.where) {
        for(const [key, value] of Object.entries(conf.where)) {
            request += ` AND ${key} = ?`;
            bindings.push(value);
        }
    }

    if (conf?.limit && conf?.limit !== 'all') {
        request += " LIMIT ?"
        bindings.push(parseInt(conf.limit));
    } else {
        request += " LIMIT 50"
    }
    request += ";"

    let bindedRequest = request;
    if ((request.match(/\?/g) || []).length === bindings.length) {
        for(let i = 0; i < (request.match(/\?/g) || []).length; i++) {
            bindedRequest = bindedRequest.replace('?', bindings[i]);
        }
    }

    connection.connect(err => {
        if (!err) {
            connection.query(request, bindings, async (err, result, fields, query) => {
                if (err) {
                    connection.end();
                    return res.send({
                        success: false,
                        error: err
                    })
                }

                const connection2 = mysql.createConnection({
                    host: DBCONNECTION.serveur ?? 'localhost',
                    user: DBCONNECTION.user ?? 'root',
                    password: DBCONNECTION.pwd ?? 'root',
                    database: 'information_schema',
                    port: DBCONNECTION.port ?? 3306
                });

                const constraintsQuery = `
                SELECT rc.TABLE_NAME, ifc.FOR_COL_NAME, rc.REFERENCED_TABLE_NAME, ifc.REF_COL_NAME
                FROM TABLE_CONSTRAINTS tb
                JOIN INNODB_FOREIGN_COLS ifc
                    ON ifc.ID = CONCAT(tb.CONSTRAINT_SCHEMA, '/', tb.CONSTRAINT_NAME)
                JOIN REFERENTIAL_CONSTRAINTS rc
                    ON rc.CONSTRAINT_NAME = tb.CONSTRAINT_NAME

                WHERE tb.TABLE_SCHEMA = '${params.databaseName}'
                    AND tb.TABLE_NAME = '${params.tableName}'
                    AND tb.CONSTRAINT_TYPE = 'FOREIGN KEY'
                `;

                connection2.connect(err => {
                    if (!err) {
                        connection2.query(constraintsQuery, async (err, result2, fields) => {
                            if (err) {
                                connection2.end();
                                return res.send({
                                    success: false,
                                    error: err
                                })
                            }

                            return res.send({
                                request: bindedRequest,
                                constraints: result2,
                                success: result,
                            })

                        })
                    } else {
                        connection2.end();
                        return res.send({
                            success: false,
                            error: err
                        })
                    }
                });


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