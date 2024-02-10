const { MysqlDB } = require("../../database/database")

exports.getAllUsersPrivilege = async (req, res, _) => {
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    await DB.connection.query(`USE information_schema;`);

    const result = await new Promise((resolve, reject) => {
        DB.connection.query("SELECT * FROM USER_ATTRIBUTES;", (err, result, fields) => {
            if (err) {
                return reject({
                    success: false,
                    error: err
                });
            } else {
                return resolve({
                    success: result
                })
            }
        })
    })

    return res.send(result)
}

exports.getCurrentUser = async (req, res, _) => {
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    await DB.connection.query(`USE information_schema;`);

    const result = await new Promise((resolve, reject) => {
        DB.connection.query("SELECT CURRENT_USER();", (err, result, fields) => {
            if (err) {
                return reject({
                    success: false,
                    error: err
                });
            } else {
                return resolve({
                    success: result
                })
            }
        })
    })

    return res.send(result)
}





