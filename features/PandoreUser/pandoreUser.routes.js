const router = require("express-promise-router")();
const { getUserConf, saveUserConf } = require("./pandoreUser.controller")

router.route("/pandore-user/conf")
    .get(getUserConf)
    .post(saveUserConf);

module.exports = router;
