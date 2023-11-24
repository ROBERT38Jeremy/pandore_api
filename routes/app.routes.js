const ConnectionRoutes = require("../features/Connection/connection.routes");
const displayDatabaseRoutes = require('../features/DisplayDatabase/displayDatabase.routes')
const displayTableToutes = require('../features/displayTable/displayTable.routes')
const rawQueryRoutes = require('../features/RawQuery/rawQuery.routes')
const userRoutes = require('../features/User/rawQuery.routes')

const expressMiddlewareRoutes = (app) => {
	app.get("/api", (_, res) => {
		return res.status(200).json({ success: "Welcome to lamusee's API" });
	});

	app.use("/api", [ConnectionRoutes, displayDatabaseRoutes, displayTableToutes, rawQueryRoutes, userRoutes]);
};

module.exports = { expressMiddlewareRoutes };