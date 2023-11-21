const { MysqlDB } = require("../../database/database")

exports.getTableStrucure = async (req, res, _) => {
    const { params } = req
    const DB = MysqlDB.getInstance();
    if (DB === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    await DB.connection.query(`USE ${params.databaseName};`);

    const result = await new Promise((resolve, reject) => {
        DB.connection.query("DESCRIBE " + params.tableName, (err, result, fields) => {
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

    return res.send(result)
}

exports.getTableDatas = async (req, res, _) => {
    const { params } = req
    const conf = req.body
    const DB = MysqlDB.getInstance();
    if (DB === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }

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

    await DB.connection.query(`USE ${params.databaseName};`);
    const resultDatas = await new Promise((resolve, reject) => {
        DB.connection.query(request, bindings, (err, result, fields) => {
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
    await DB.connection.query(`USE information_schema;`);
    const resultForeign = await new Promise((resolve, reject) => {
        DB.connection.query(constraintsQuery, (err, result, fields) => {
            if (err) {
                return res.send({
                    success: false,
                    error: err
                })
            }

            return res.send({
                request: bindedRequest,
                constraints: result,
                success: resultDatas.success,
            })
        })
    })

    return res.send(resultForeign)
}