const router = require("express-promise-router")();
const { getTableStrucure, getTableDatas, getDatabaseTablesStructure } = require("./displayTable.controller")

router.route("/database/:databaseName/:tableName/structure").get(getTableStrucure);
router.route("/database/:databaseName/:tableName/datas").post(getTableDatas);

router.route("/database/:databaseName/structure").get(getDatabaseTablesStructure);

module.exports = router;
