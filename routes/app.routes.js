const ConnectionRoutes = require("../features/Connection/connection.routes");
const displayDatabaseRoutes = require('../features/DisplayDatabase/displayDatabase.routes')
const displayTableRoutes = require('../features/displayTable/displayTable.routes')
const tableDatasRoutes = require('../features/TableDatas/tableDatas.routes')
const rawQueryRoutes = require('../features/RawQuery/rawQuery.routes')
const userRoutes = require('../features/User/user.routes')
const pandoreUserRoutes = require('../features/PandoreUser/pandoreUser.routes')

const expressMiddlewareRoutes = (app) => {
	app.get("/api", (_, res) => {
		return res.status(200).json({ success: "Welcome to lamusee's API" });
	});

	app.use("/api/sql", [ConnectionRoutes, displayDatabaseRoutes, displayTableRoutes, tableDatasRoutes, rawQueryRoutes, userRoutes, pandoreUserRoutes]);
};

module.exports = { expressMiddlewareRoutes };