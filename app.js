const path = require('path');
const express = require('express');
// const app = express();
var app = express();

const bodyParser = require('body-parser');
const http = require('http');
// const socketio = require('socket.io');
app.set('view engine', 'ejs');
var port = require('./config/port.json');
var userRouter = require('./routes/user.routes.js');
var authRouter = require('./routes/auth.routes.js');
var mapRouter = require('./routes/map.routes.js');
var branchRouter = require('./routes/branch.routes.js');
var resourcesRouter = require('./routes/resources.routes.js');
var reservationRouter = require('./routes/reservation.routes.js');
var visitRouter = require('./routes/visit.routes.js');
var checkJWT = require('./middleware/check_jwt.js');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerOptions = {
	swaggerDefinition: {
		info : {
			title: 'Amugong',
			version: '1.0.0',
			description: 'Api description for Amugong',
			host: "localhost:8000"
		}
	},
	apis : ["./routes/*.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

console.log("hello");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
// app.use('/api/map', checkJWT ,authRouter);
app.use('/api/map' ,mapRouter);
app.use('/api/branch',branchRouter);
app.use('/api/resources' ,resourcesRouter);
app.use('/api/reservation' , checkJWT,reservationRouter);
app.use('/api/visit', checkJWT, visitRouter);
//app.use('/api/branch' ,checkJWT,branchRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port.port}`)
})
