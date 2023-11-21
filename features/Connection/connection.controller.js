const { MysqlDB } = require("../../database/database")

exports.tryConnection = (req, res, _) => {
    const DB = MysqlDB.getInstance(req.body);
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    } else {
        return res.send({
            success: true,
        })
    }
}

exports.backendIsConnected = (req, res, _) => {
    return res.send({
        success: MysqlDB.instanceExists(),
    })
}