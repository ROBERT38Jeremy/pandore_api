const router = require("express-promise-router")();
const { getAllUsersPrivilege, getCurrentUser } = require("./user.controller")

router.route("/user/current").get(getCurrentUser);
router.route("/user/privileges").get(getAllUsersPrivilege);

module.exports = router;
