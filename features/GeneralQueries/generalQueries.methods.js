const { UtilClass } = require("../../utils/UtilClass")

exports.GeneralQueries = class extends UtilClass {
    static async getCollation() {
        try {
            const DB = this.getDBInstance()
            if (DB === false) return { success: false, error: 'Connection failed' }

            const result = await new Promise((resolve, reject) => {
                DB.connection.query("SHOW COLLATION;", [], (err, result, fields) => {
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
        } catch (error) {
            console.log(error)
            return 'Something went wrong'
        }
    }
}