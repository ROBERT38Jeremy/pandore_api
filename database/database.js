const mysql = require('mysql');
let DBCONNECTION = {};

class MysqlDB {
    #instance;
    #connectionBody;
    connection;

    constructor() {}

    static instanceExists() {
        if (!this.instance || !this.instance?.connectionBody) {
            return false
        } else {
            return true;
        }
    }

    static getInstance(DBCONNECTION = {}) {
        if (!this.instance) {
            this.instance = new MysqlDB();
            this.instance.connectionBody = DBCONNECTION;
            this.instance.init();
        }
        return this.instance;
    }

    static removeInstance() {
        this.instance.connectionBody = null;
        this.instance                = null;
    }

    init() {
        try {
            if (
                !this.connectionBody.serveur ||
                !this.connectionBody.user ||
                !this.connectionBody.pwd
            ) {
                this.instance          = null;
                this.connectionBody    = null;
                return this.connection = null;
            }
            this.connection = mysql.createConnection({
                host: this.connectionBody?.serveur,
                user: this.connectionBody?.user,
                password: this.connectionBody?.pwd,
                port: this.connectionBody?.port ?? 3306,
                insecureAuth : true,
                dateStrings: 'date'
            });

            this.connection.connect();
        } catch (error) {
            this.connection = null;
            console.log('init error', error)
        }
    }
}
module.exports = {MysqlDB, DBCONNECTION};