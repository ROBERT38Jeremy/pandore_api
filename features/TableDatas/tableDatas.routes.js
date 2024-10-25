const router = require("express-promise-router")();
const { insertTableDatas, exportTableDatasToCSV } = require("./tableDatas.controller")

router.route("/database/:databaseName/:tableName/insert").post(insertTableDatas);
router.route("/database/:database/:table/export").get(exportTableDatasToCSV);

module.exports = router;
