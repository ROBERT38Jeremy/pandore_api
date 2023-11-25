const router = require("express-promise-router")();
const { getUserConf } = require("./pandoreUser.controller")

router.route("/pandore-user/conf").get(getUserConf);

module.exports = router;
