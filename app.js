const express = require('express')
const cors = require("cors");
const { expressMiddlewareRoutes } = require("./routes/app.routes");

const app = express()
const port = 3001

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: true,
    })
);

expressMiddlewareRoutes(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})