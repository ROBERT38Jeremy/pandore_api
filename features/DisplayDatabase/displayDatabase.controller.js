const { DisplayDatabase } = require("./displayDatabase.methods")

exports.getDatabaseStrucure = async (req, res, _) => {
    const result = await DisplayDatabase.getDatabaseStructure(req.params.database);

    return res.send(result)
}

exports.getDatabasesList = async (req, res, _) => {
    const result = await DisplayDatabase.getDatabasesList();

    return res.send(result)
}

exports.getDatabasesMenuList = async (req, res, _) => {

    const databaseMenuList = {};
    const DB = DisplayDatabase.getDBInstance();
    const databaseList = await DisplayDatabase.getDatabasesList();
    if (databaseList?.success === false) {
        return res.send(databaseList)
    }

    for (const db of databaseList.success) {
        await DB.connection.query(`USE information_schema;`);

        await new Promise((resolve, reject) => {
            DB.connection.query("SELECT * FROM `TABLES` WHERE `TABLE_SCHEMA` = ?;", [ db ], (err, result, fields) => {
                if (err) {
                    return reject();
                } else {
                    databaseMenuList[db] =  result.map((table) => {
                        return table.TABLE_NAME;
                    });
                    return resolve();
                }
            })
        })
    }

    return res.send({ success: databaseMenuList })
}