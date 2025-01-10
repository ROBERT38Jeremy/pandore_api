const router = require("express-promise-router")();
const { createDatabase } = require("./manageDatabases.controller")

router.route("/database/create").post(createDatabase);

module.exports = router;
