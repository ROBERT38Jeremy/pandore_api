const { MysqlDB } = require("../../database/database")
const { getConf } = require("../../utils/pandoreConf")
const defaultHiddenDatabases = ['information_schema', 'mysql', 'performance_schema', 'sys'];

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
    const pandoreConf = await getConf();
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    const disabledDatabase = pandoreConf?.databases?.hidden ?? defaultHiddenDatabases;
    const result = await new Promise((resolve, reject) => {
        DB.connection.query("SHOW DATABASES;", (err, result, fields) => {
            if (err) {
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

exports.getDatabasesMenuList = async (req, res, _) => {
    const pandoreConf = await getConf();
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    const databaseMenuList = {};
    const disabledDatabase = pandoreConf?.databases?.hidden ?? defaultHiddenDatabases;
    const databaseList = await new Promise((resolve, reject) => {
        DB.connection.query("SHOW DATABASES;", (err, result, fields) => {
            if (err) {
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
    if (databaseList?.success === false) {
        return res.send(databaseList)
    }

    databaseList.success.forEach(async (db) => {
        await DB.connection.query(`USE information_schema;`);

        await new Promise((resolve, reject) => {
            DB.connection.query("SELECT * FROM `TABLES` WHERE `TABLE_SCHEMA` = ?;", [ db ], (err, result, fields) => {
                if (err) {
                    return reject();
                } else {
                    databaseMenuList[db] =  result.map((table) => {
                        return table.TABLE_NAME;
                    });
                    return resolve();
                }
            })
        })
    });

    setTimeout(() => {
        return res.send({ success: databaseMenuList })
    }, 1000)
}