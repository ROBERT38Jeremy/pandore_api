const { MysqlDB } = require("../../database/database")
const { DisplayTableMethods } = require("./displayTable.methods")

exports.getTableStrucure = async (req, res, _) => {
    const { params } = req
    const DB = MysqlDB.getInstance();
    if (DB === null || DB?.connection === null) {
        return res.send({
            success: false,
            error: 'Connection failed'
        })
    }

    // récupération de la structure de la table
    const resultStructure = await DisplayTableMethods.getTableStructure(params.databaseName, params.tableName)
    if (resultStructure === false) {
        return res.send({
            success: false,
            error: 'Failed to get structure Table'
        })
    }

    // Récupération des clé étrangères
    const constraintResult = await DisplayTableMethods.getTableConstraints(params.databaseName, params.tableName);
    if (constraintResult === false) {
        return res.send({
            success: false,
            error: 'Failed to get structure Table'
        })
    }

    // Récupération des index
    const indexResult = await DisplayTableMethods.getTableIndexes(params.databaseName, params.tableName);
    if (indexResult.success === false) {
        return res.send({
            success: false,
            error: 'Failed to get Table\'s indexes'
        })
    }

    return res.send({
        success: resultStructure,
        foreign: constraintResult,
        index: indexResult,
    })
}

exports.getTableDatas = async (req, res, _) => {
    try {
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
        let request = `SELECT ${querySelect} FROM ${params.tableName}`;
        let bindings = [];

        if ((conf?.where || []).length > 0) {
            request += '  WHERE 1';
            conf.where.forEach((statement) => {
                if (!['IS NULL', 'IS NOT NULL'].includes(statement.operator)) {
                    request += ` AND ${statement.field} ${statement.operator} ?`;
                    bindings.push(statement.value);
                } else {
                    request += ` AND ${statement.field} ${statement.operator}`;
                }
            });
        } else if (conf?.whereString) {
            request += ` WHERE ${conf?.whereString}`;
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

        // récupération de la structure de la table
        const resultStructure = await DisplayTableMethods.getTableStructure(params.databaseName, params.tableName);

        // récupération des clés étrangères
        const resultForeign = await DisplayTableMethods.getTableForeignKeys(params.databaseName, params.tableName);

        // Récupération des clés primaires
        const resultIndexes = await DisplayTableMethods.getTableIndexes(params.databaseName, params.tableName, true);

        const resultToSend = {
            conf: conf,
            primary: resultIndexes,
            request: bindedRequest,
            constraints: resultForeign,
            structure: resultStructure,
            success: resultDatas.success,
        };

        return res.send(resultToSend)
    } catch (error) {
        console.log(error?.error?.sqlMessage ?? error)
        return res.send({ error: error?.sqlMessage ?? error })
    }
}

exports.getDatabaseTablesStructure = async (req, res, _) => {
    try {

        const { params } = req
        const DB = MysqlDB.getInstance();
        if (DB === null || DB?.connection === null) {
            return res.send({
                success: false,
                error: 'Connection failed'
            })
        }

        const tableNumberQuery = `
            SELECT COUNT(*) AS nb_table
            FROM TABLES t
            WHERE t.TABLE_SCHEMA = '${params.databaseName}'
        `;
        await DB.connection.query(`USE information_schema;`);
        const resultTableNumber = await new Promise((resolve, reject) => {
            DB.connection.query(tableNumberQuery, (err, result, fields) => {
                if (err) {
                    return reject({
                        success: false,
                        error: err
                    })
                }

                if (result[0].nb_table > 10) {
                    return resolve({
                        success: false,
                        error: 'Too many tables'
                    })
                }

                return resolve({
                    success: result,
                })
            })
        })

        if (resultTableNumber.success === false) {
            return res.send({
                success: false,
                error: resultTableNumber.error
            })
        }

        const query = `
            SELECT
                t.TABLE_NAME,
                c.COLUMN_NAME,
                c.COLUMN_TYPE,
                c.COLUMN_KEY,
                c.Extra,
                kcu.REFERENCED_TABLE_NAME,
                kcu.REFERENCED_COLUMN_NAME
            FROM TABLES t
            JOIN COLUMNS c
                ON c.TABLE_SCHEMA = t.TABLE_SCHEMA
                AND c.TABLE_NAME = t.TABLE_NAME
            LEFT JOIN KEY_COLUMN_USAGE kcu
                ON kcu.TABLE_SCHEMA = t.TABLE_SCHEMA
                AND kcu.TABLE_NAME = c.TABLE_NAME
                AND kcu.COLUMN_NAME = c.COLUMN_NAME
                AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
            WHERE t.TABLE_SCHEMA = '${params.databaseName}'
            ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;`;

        await DB.connection.query(`USE INFORMATION_SCHEMA;`);
        const resultStructure = await new Promise((resolve, reject) => {
            DB.connection.query(query, (err, result, fields) => {
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
        return res.send({
            success: resultStructure.success
        })
    } catch (error) {
        console.log(error);
        return res.send({
            success: false,
            error: 'Somthing went Wrong'
        })
    }
}