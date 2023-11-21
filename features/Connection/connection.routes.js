const router = require("express-promise-router")();
const { tryConnection, backendIsConnected } = require("./connection.controller")

router.route("/try/connect").post(tryConnection);
router.route("/is-connected").get(backendIsConnected);

module.exports = router;
