const router = require("express-promise-router")();
const { TryConnection } = require("./connection.controller")

router.route("/try/connect").post(TryConnection);

module.exports = router;
