const router = require("express-promise-router")();
const { getAllUsersPrivilege } = require("./user.controller")

router.route("/user/privileges").get(getAllUsersPrivilege);

module.exports = router;
