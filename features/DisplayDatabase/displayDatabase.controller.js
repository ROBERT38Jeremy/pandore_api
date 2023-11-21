const { MysqlDB } = require("../../database/database")

exports.getDatabaseStrucure = async (req, res, _) => {
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    await DB.connection.query(`USE information_schema;`);

    const result = await new Promise((resolve, reject) => {
        DB.connection.query("SELECT * FROM `TABLES` WHERE `TABLE_SCHEMA` = ?;", [ req.params.database ], (err, result, fields) => {
            if (err) {
                return reject({
                    success: false,
                    error: err
                });
            } else {
                return resolve({
                    success: result,
                    error: err
                })
            }
        })
    })

    return res.send(result)
}

exports.getDatabasesList = async (req, res, _) => {
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    const disabledDatabase = ['information_schema', 'mysql', 'performance_schema', 'sys'];
    const result = await new Promise((resolve, reject) => {
        DB.connection.query("SHOW DATABASES;", (err, result, fields) => {
            if (err) {
                connection.end();
                return reject({
                    success: false,
                    error: err
                })
            }

            return resolve({
                success: result
                    .filter((databaseName) => {
                        return !disabledDatabase.includes(databaseName.Database)
                    })
                    .map((databaseName) => {
                        return databaseName.Database
                    })
            })
        })
    })

    return res.send(result)
}