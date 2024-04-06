const { MysqlDB } = require("../database/database")

exports.UtilClass = class {
    static getDBInstance() {
        const DB = MysqlDB.getInstance();
        if (DB === null || DB?.connection === null) {
            return false;
        }
        return DB;
    }
}