const express = require('express')

const app = express()
const mongoose = require('mongoose')

const bodyParser = require('body-parser')
const config = require('config')
const port = config.get('port.serverPort') || 4000
const db_connection = config.get('db.connection-string')

const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const userRouter = require('./api/router/userRouter')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

const store = new MongoDBStore({
	uri: db_connection,
	collection: 'sessions',
})
const db_options = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
}

app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
)

app.use(function (req, res, next) {
	var origin = req.headers.origin
	var allowedOrigins = [origin]
	var allowedOrigins = ['http://localhost:3000']
	console.log('req.headers.origin', req.headers.origin)
	if (origin === undefined || origin === null) {
		res.header('Access-Control-Allow-Credentials', true)
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Request-Headers', true)
		res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
		res.header(
			'Access-Control-Allow-Headers',
			'X-Requested-With, Content-Type, Accept, Authorization'
		)

		return next()
	}
	if (req.method == 'OPTIONS') {
		res.header('Access-Control-Allow-Credentials', true)
		res.header('Access-Control-Request-Headers', true)
		res.setHeader('Access-Control-Allow-Origin', origin)
		res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
		res.header(
			'Access-Control-Allow-Headers',
			'X-Requested-With, Content-Type, Accept, Authorization'
		)

		return res.sendStatus(200)
	}

	if (allowedOrigins.indexOf(origin) > -1) {
		res.header('Access-Control-Allow-Credentials', true)
		res.header('Access-Control-Request-Headers', true)
		res.setHeader('Access-Control-Allow-Origin', origin)
		res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
		res.header(
			'Access-Control-Allow-Headers',
			'X-Requested-With, Content-Type, Accept, Authorization'
		)

		return next()
	}
	return next()
})

app.use((request, response, next) => {
	// console.log(request.session)
	// console.log(request.user)

	console.log(request.url) ///router

	// console.log("query=>>", request.query)
	// console.log("query=>>", request.body)
	// return response.status(404).send({ message: "User Successfully Added" })
	next()
})

app.use('/api', userRouter)
app.use('/api/public', express.static('public'))

mongoose
	.connect(db_connection, db_options)
	.then(async (res) => {
		app.listen(port, () => {
			console.log(
				'Database connection successful and Server running on port:',
				port
			)
		})
	})
	.catch((err) => console.log(err))
