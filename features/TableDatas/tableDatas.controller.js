const { MysqlDB } = require("../../database/database")
const { getConf } = require("../../utils/pandoreConf")

exports.insertTableDatas = async (req, res, _) => {
    try {
        const { database, table, datas } = req.body
        const DB = MysqlDB.getInstance();
        if (DB === null || DB?.connection === null) {
            return res.send({
                success: false,
                error: 'Connection failed'
            })
        }

        const ROWS = "`"+Object.keys(datas).join("`, `")+"`";
        const VALUES = Object.values(datas).map((value) => '?').join(", ");
        const BINDINGS = Object.values(datas);
        const SQL = `INSERT INTO ${table} (${ROWS}) VALUES (${VALUES});`;

        await DB.connection.query(`USE ${database};`);
        const resultStructure = await new Promise((resolve, reject) => {
            DB.connection.query(SQL, BINDINGS, (err, result, fields) => {
                if (err) {
                    return reject({
                        success: false,
                        error: err
                    })
                }

                return resolve({
                    success: result
                })
            })
        })

        return res.send({
            success: resultStructure.success
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            error: 'Something went wrong'
        })
    }
}