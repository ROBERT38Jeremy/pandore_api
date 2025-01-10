const router = require("express-promise-router")();
const { getCollation } = require("./generalQueries.controller")

router.route("/general/collation").get(getCollation);

module.exports = router;
