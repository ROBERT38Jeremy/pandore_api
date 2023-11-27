const router = require("express-promise-router")();
const { getDatabaseStrucure, getDatabasesList, getDatabasesMenuList } = require("./displayDatabase.controller")

router.route("/database/list").get(getDatabasesList);
router.route("/database/:database/data").get(getDatabaseStrucure);
router.route("/database/menu-list").get(getDatabasesMenuList);

module.exports = router;
