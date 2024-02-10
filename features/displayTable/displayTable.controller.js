const { MysqlDB } = require("../../database/database")
const { getConf } = require("../../utils/pandoreConf")

exports.getTableStrucure = async (req, res, _) => {
    const { params } = req
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }
    await DB.connection.query(`USE ${params.databaseName};`);
    const resultStructure = await new Promise((resolve, reject) => {
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
    if (resultStructure.success === false) {
        return res.send({
            success: false,
            error: 'Failed to get structure Table'
        })
    }

    // Récupération des clé étrangères
    const constraintsQuery = `
        SELECT rc.CONSTRAINT_NAME, ifc.FOR_COL_NAME, ifc.REF_COL_NAME, rc.UPDATE_RULE, rc.DELETE_RULE, rc.REFERENCED_TABLE_NAME
        FROM REFERENTIAL_CONSTRAINTS rc
        JOIN INNODB_FOREIGN_COLS ifc
            ON ifc.ID = CONCAT(rc.CONSTRAINT_SCHEMA, '/', rc.CONSTRAINT_NAME)
        WHERE rc.CONSTRAINT_SCHEMA = '${params.databaseName}'
            AND rc.TABLE_NAME = '${params.tableName}'
    `;
    await DB.connection.query(`USE information_schema;`);
    const constraintResult = await new Promise((resolve, reject) => {
        DB.connection.query(constraintsQuery, (err, result, fields) => {
            if (err) {
                return reject({
                    success: false,
                    error: err
                })
            }

            return resolve({
                success: result,
            })
        })
    })
    if (constraintResult.success === false) {
        return res.send({
            success: false,
            error: 'Failed to get structure Table'
        })
    }

    // Récupération des index
    const indexQuery = `
        SELECT kcu.COLUMN_NAME, tc.CONSTRAINT_TYPE
        FROM TABLE_CONSTRAINTS tc
        JOIN KEY_COLUMN_USAGE kcu
            ON kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
            AND kcu.TABLE_NAME = tc.TABLE_NAME
            AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_SCHEMA = '${params.databaseName}'
            AND tc.TABLE_NAME = '${params.tableName}'
    `;
    await DB.connection.query(`USE information_schema;`);
    const indexResult = await new Promise((resolve, reject) => {
        DB.connection.query(indexQuery, (err, result, fields) => {
            if (err) {
                return reject({
                    success: false,
                    error: err
                })
            }

            return resolve({
                success: result,
            })
        })
    })
    if (indexResult.success === false) {
        return res.send({
            success: false,
            error: 'Failed to get Table\'s indexes'
        })
    }

    return res.send({
        success: resultStructure.success,
        foreign: constraintResult.success,
        index: indexResult.success,
    })
}

exports.getTableDatas = async (req, res, _) => {
    try {
        const pandoreConf = await getConf();

        const { params } = req
        const conf = req.body
        const DB = MysqlDB.getInstance();
        if (DB === null || DB?.connection === null) {
            return res.send({
                success: false,
                error: 'Connection failed'
            })
        }

        const querySelect = (conf.select || []).length > 0 ? conf.select.join(', ') : '*';

        // contruction de la requête
        let request = `SELECT ${querySelect} FROM ${params.tableName} WHERE 1`;
        let bindings = [];

        if (conf.where) {
            conf.where.forEach((statement) => {
                if (!['IS NULL', 'IS NOT NULL'].includes(statement.operator)) {
                    request += ` AND ${statement.field} ${statement.operator} ?`;
                    bindings.push(statement.value);
                } else {
                    request += ` AND ${statement.field} ${statement.operator}`;
                }
            });
        }

        if (conf?.limit && conf?.limit !== 'all') {
            request += " LIMIT ?"
            bindings.push(parseInt(conf.limit));
        } else if (pandoreConf?.conf?.tables?.query?.defaultLimit) {
            request += ` LIMIT ${pandoreConf.conf.tables.query.defaultLimit}`
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

        await DB.connection.query(`USE ${params.databaseName};`);
        const resultStructure = await new Promise((resolve, reject) => {
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
                    return reject({
                        success: false,
                        error: err
                    })
                }

                return resolve({
                    success: result,
                })
            })
        })

        // Récupération des index
        const indexQuery = `
            SELECT kcu.COLUMN_NAME
            FROM TABLE_CONSTRAINTS tc
            JOIN KEY_COLUMN_USAGE kcu
                ON kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
                AND kcu.TABLE_NAME = tc.TABLE_NAME
                AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
            WHERE tc.CONSTRAINT_SCHEMA = '${params.databaseName}'
                AND tc.TABLE_NAME = '${params.tableName}'
                AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        `;
        await DB.connection.query(`USE information_schema;`);
        const resultIndex = await new Promise((resolve, reject) => {
            DB.connection.query(indexQuery, (err, result, fields) => {
                if (err) {
                    return reject({
                        success: false,
                        error: err
                    })
                }

                return resolve({
                    conf: conf,
                    primary: result,
                    request: bindedRequest,
                    constraints: resultForeign.success,
                    structure: resultStructure.success,
                    success: resultDatas.success,
                })
            })
        })

        return res.send(resultIndex)
    } catch (error) {
        console.log(error?.error?.sqlMessage ?? error)
        return res.send({ error: error?.sqlMessage ?? error })
    }
}