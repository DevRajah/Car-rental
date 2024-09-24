require('./dbConfig/dbConfig');
// require('./helpers/socialLogin');
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const passport = require('./helpers/socialLogin');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const bodyParser = require('body-parser');
require('dotenv').config();
const router = require('./routers/userRouter');
const socialRouter = require('./routers/socialRouter');
const carRouter =  require('./routers/carRouter')
const cartRouter =  require('./routers/cartRouter')

const port = process.env.PORT

const corsOptions = {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
};

// Middleware for CORS
app.use(cors(corsOptions));

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize passport and use passport session
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    return res.send("Welcome to FiveSquares API!");
})

app.use(router);
app.use(socialRouter);
app.use(cartRouter)
app.use(carRouter)

const swaggerDocument = YAML.load('./utils/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Add error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing error
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    res.status(500).json({ message: 'Internal Server Error: ' + err });
    next();
});

app.listen(port, () => {
    console.log('Server up and running on port: ' + port);
})