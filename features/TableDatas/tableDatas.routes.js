const router = require("express-promise-router")();
const { insertTableDatas } = require("./tableDatas.controller")

router.route("/database/:databaseName/:tableName/insert").post(insertTableDatas);

module.exports = router;
