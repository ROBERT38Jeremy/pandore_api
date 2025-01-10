const { UtilClass } = require("../../utils/UtilClass")

exports.ManageDatabases = class extends UtilClass {
    static async createDatabase(databaseName, collation) {
        try {
            const DB = this.getDBInstance()
            if (DB === false) return { success: false, error: 'Connection failed' }

            const result = await new Promise((resolve, reject) => {
                DB.connection.query(`CREATE DATABASE ${databaseName} COLLATE ${collation}`, [], (err, result, fields) => {
                    if (err) {
                        return reject({
                            success: false,
                            error: err
                        });
                    } else {
                        return resolve({
                            success: 'Database Created',
                            error: err
                        })
                    }
                })
            })

            return result
        } catch (error) {
            console.log(error)
            return {
                success: false,
                error: 'Something went wrong'
            }
        }
    }
}