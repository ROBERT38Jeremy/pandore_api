const { MysqlDB } = require("../database/database")

exports.getProcessList = async (ws) => {
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return {
            success: false,
            error: 'Connection failed'
        }
    }
    // await DB.connection.query(`USE ${database};`);

    const result = await new Promise((resolve, reject) => {
        DB.connection.query('SHOW PROCESSLIST;', (err, result, fields) => {
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
    return result;
}