const router = require("express-promise-router")();
const { getTableStrucure, getTableDatas } = require("./displayTable.controller")

router.route("/database/:databaseName/:tableName/structure").get(getTableStrucure);
router.route("/database/:databaseName/:tableName/datas").post(getTableDatas);

module.exports = router;
