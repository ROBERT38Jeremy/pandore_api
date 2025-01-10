const { ManageDatabases } = require("./manageDatabases.methods")

exports.createDatabase = async (req, res, _) => {
    console.log(req.body.databaseName, req.body.collation);
    
    const result = await ManageDatabases.createDatabase(req.body.databaseName, req.body.collation);

    return res.send(result)
}