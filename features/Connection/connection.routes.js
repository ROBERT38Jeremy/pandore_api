const router = require("express-promise-router")();
const { tryConnection, backendIsConnected, disconnect } = require("./connection.controller")

router.route("/try/connect").post(tryConnection);
router.route("/is-connected").get(backendIsConnected);
router.route("/disconnect").get(disconnect);

module.exports = router;
