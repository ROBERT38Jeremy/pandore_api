const { UtilClass } = require("../../utils/UtilClass")
const { getConf } = require("../../utils/pandoreConf")
const defaultHiddenDatabases = ['information_schema', 'mysql', 'performance_schema', 'sys'];

exports.DisplayDatabase = class extends UtilClass {
    static async getDatabaseStructure(databaseName) {
        const DB = this.getDBInstance()
        if (DB === false) return { success: false, error: 'Connection failed' }

        await DB.connection.query(`USE information_schema;`);

        const result = await new Promise((resolve, reject) => {
            DB.connection.query("SELECT * FROM `TABLES` WHERE `TABLE_SCHEMA` = ?;", [ databaseName ], (err, result, fields) => {
                if (err) {
                    return reject({
                        success: false,
                        error: err
                    });
                } else {
                    return resolve({
                        success: result,
                        error: err
                    })
                }
            })
        })

        return result
    }

    static async getDatabasesList() {
        const DB = this.getDBInstance()
        if (DB === false) return { success: false, error: 'Connection failed' }

        const pandoreConf = await getConf();

        const disabledDatabase = pandoreConf?.conf?.databases?.hidden ?? defaultHiddenDatabases;
        const result = await new Promise((resolve, reject) => {
            DB.connection.query("SHOW DATABASES;", (err, result, fields) => {
                if (err) {
                    return reject({
                        success: false,
                        error: err
                    })
                }

                return resolve({
                    success: result
                        .filter((databaseName) => {
                            return !disabledDatabase.includes(databaseName.Database)
                        })
                        .map((databaseName) => {
                            return databaseName.Database
                        })
                })
            })
        })

        return result
    }
}