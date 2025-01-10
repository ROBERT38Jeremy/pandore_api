const { GeneralQueries } = require("./generalQueries.methods")

exports.getCollation = async (req, res, _) => {
    const result = await GeneralQueries.getCollation();

    if (result.success) {
        const collations = {};
        for (const collation of result.success) {
            collations[collation.Charset] ??= [];
            collations[collation.Charset].push(collation.Collation);
        }

        return res.send({ success: collations });
    }

    return res.send(result)
}