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

    await DB.connection.query(`USE information_schema;`);
    for (const db of databaseList.success) {
        const databaseTablesSchemas = await DisplayDatabase.getDatabaseStructure(db);

        databaseMenuList[db] = await databaseTablesSchemas.success.map((table) => {
            return table.TABLE_NAME;
        });
    }

    return res.send({ success: databaseMenuList })
}