const { MysqlDB } = require("../../database/database")

exports.TryConnection = (req, res, _) => {
    const DB = MysqlDB.getInstance(req.body);
    if (DB === null) {
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