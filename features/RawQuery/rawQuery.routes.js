const router = require("express-promise-router")();
const { processRawQuery } = require("./rawQuery.controller")

router.route("/:database/raw-query").get(processRawQuery);

module.exports = router;
