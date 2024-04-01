const router = require("express-promise-router")();
const { getAllUsers, getCurrentUser, getCurrentUserPrivileges } = require("./user.controller")

router.route("/user/current").get(getCurrentUser);
router.route("/user/list").get(getAllUsers);
router.route("/user/privileges").get(getCurrentUserPrivileges);

module.exports = router;
