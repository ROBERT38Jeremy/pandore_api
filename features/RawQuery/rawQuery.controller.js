const { MysqlDB } = require("../../database/database")

exports.processRawQuery = async (req, res, _) => {
    try {
        const { database } = req.params;
        const { request } = req.query

        const DB = MysqlDB.getInstance();
        if (DB === null || DB?.connection === null) {
            return res.send({
                success: false,
                error: 'Connection failed'
            })
        }
        await DB.connection.query(`USE ${database};`);

        const result = await new Promise((resolve, reject) => {
            DB.connection.query(request, (err, result, fields) => {
                if (err) {
                    return reject({
                        success: false,
                        error: err
                    });
                } else {
                    return resolve({
                        success: result,
                        database: database,
                        request: request
                    })
                }
            })
        })

        return res.send(result)
    } catch (error) {
        console.log(error?.error?.sqlMessage ?? error)
        return res.send({ error: error?.error?.sqlMessage ?? error })
    }
}