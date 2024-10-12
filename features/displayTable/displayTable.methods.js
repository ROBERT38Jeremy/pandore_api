const { UtilClass } = require("../../utils/UtilClass")
const { getConf } = require("../../utils/pandoreConf")
const defaultHiddenDatabases = ['information_schema', 'mysql', 'performance_schema', 'sys'];

exports.DisplayTableMethods = class extends UtilClass {
    static async getTableStructure(databaseName, tableName) {
        const DB = this.getDBInstance()
        if (DB === false) return { success: false, error: 'Connection failed' }

        await DB.connection.query(`USE ${databaseName};`);

        const result = await new Promise((resolve, reject) => {
            DB.connection.query("DESCRIBE " + tableName, (err, result, fields) => {
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

        return result.success
    }

    static async getTableConstraints(databaseName, tableName) {
        const DB = this.getDBInstance()
        if (DB === false) return { success: false, error: 'Connection failed' }

        const constraintsQuery = `
            SELECT rc.CONSTRAINT_NAME, ifc.FOR_COL_NAME, ifc.REF_COL_NAME, rc.UPDATE_RULE, rc.DELETE_RULE, rc.REFERENCED_TABLE_NAME
            FROM REFERENTIAL_CONSTRAINTS rc
            JOIN INNODB_FOREIGN_COLS ifc
                ON ifc.ID = CONCAT(rc.CONSTRAINT_SCHEMA, '/', rc.CONSTRAINT_NAME)
            WHERE rc.CONSTRAINT_SCHEMA = '${databaseName}'
                AND rc.TABLE_NAME = '${tableName}'
        `;
        await DB.connection.query(`USE information_schema;`);
        const result = await new Promise((resolve, reject) => {
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

        return result.success
    }

    static async getTableForeignKeys(databaseName, tableName) {
        const DB = this.getDBInstance()
        if (DB === false) return { success: false, error: 'Connection failed' }

        const constraintsQuery = `
            SELECT rc.TABLE_NAME, ifc.FOR_COL_NAME, rc.REFERENCED_TABLE_NAME, ifc.REF_COL_NAME
            FROM TABLE_CONSTRAINTS tb
            JOIN INNODB_FOREIGN_COLS ifc
                ON ifc.ID = CONCAT(tb.CONSTRAINT_SCHEMA, '/', tb.CONSTRAINT_NAME)
            JOIN REFERENTIAL_CONSTRAINTS rc
                ON rc.CONSTRAINT_NAME = tb.CONSTRAINT_NAME

            WHERE tb.TABLE_SCHEMA = '${databaseName}'
                AND tb.TABLE_NAME = '${tableName}'
                AND tb.CONSTRAINT_TYPE = 'FOREIGN KEY'
        `;
        await DB.connection.query(`USE information_schema;`);
        const result = await new Promise((resolve, reject) => {
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

        return result.success
    }

    static async getTableIndexes(databaseName, tableName, searchPrimary = false) {
        const DB = this.getDBInstance()
        if (DB === false) return { success: false, error: 'Connection failed' }

        let wherePrimary = ``;
        if (searchPrimary === true) {
            wherePrimary = `AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'`;
        }

        const indexQuery = `
            SELECT kcu.COLUMN_NAME, tc.CONSTRAINT_TYPE
            FROM TABLE_CONSTRAINTS tc
            JOIN KEY_COLUMN_USAGE kcu
                ON kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
                AND kcu.TABLE_NAME = tc.TABLE_NAME
                AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
            WHERE tc.CONSTRAINT_SCHEMA = '${databaseName}'
                AND tc.TABLE_NAME = '${tableName}'
                ${wherePrimary}
        `;
        await DB.connection.query(`USE information_schema;`);
        const result = await new Promise((resolve, reject) => {
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

        return result.success
    }
}