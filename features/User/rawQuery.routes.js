const router = require("express-promise-router")();
const { getAllUsersPrivilege } = require("./rawQuery.controller")

router.route("/user/privileges").get(getAllUsersPrivilege);

module.exports = router;
