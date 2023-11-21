const router = require("express-promise-router")();
const { getDatabaseStrucure, getDatabasesList } = require("./displayDatabase.controller")

router.route("/database/list").get(getDatabasesList);
router.route("/database/:database/data").get(getDatabaseStrucure);

module.exports = router;
