const path = require('path');
const express = require('express');
// const app = express();
var app = express();

const bodyParser = require('body-parser');
const http = require('http');
// const socketio = require('socket.io');
app.set('view engine', 'ejs');
const helmet = require("helmet");
var port = require('./api/v1/config/port.json');
var userRouter = require('./api/v1/routes/user.routes.js');
var authRouter = require('./api/v1/routes/auth.routes.js');
var mapRouter = require('./api/v1/routes/map.routes.js');
var branchRouter = require('./api/v1/routes/branch.routes.js');
var resourcesRouter = require('./api/v1/routes/resources.routes.js');
var reservationRouter = require('./api/v1/routes/reservation.routes.js');
var visitRouter = require('./api/v1/routes/visit.routes.js');
var checkJWT = require('./api/v1/middleware/check_jwt.js');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerOptions = {
	swaggerDefinition: {
		info : {
			title: 'Amugong',
			version: '1.0.0',
			description: 'Api description for Amugong',
		}
	},
	apis : ["./api/v1/routes/*.js"]
};
app.use(express.static(path.join(__dirname, 'public')));

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/map' ,mapRouter);
app.use(helmet());


app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
// app.use('/api/map' , mapRouter);
app.use('/api/branch', checkJWT, branchRouter);
app.use('/api/resources' , checkJWT, resourcesRouter);
app.use('/api/reservation' , checkJWT,reservationRouter);
app.use('/api/visit', checkJWT, visitRouter);
//app.use('/api/branch' ,c,branchRouter);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port.port}`)
})
