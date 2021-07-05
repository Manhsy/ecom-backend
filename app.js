//npm imports
const express = require('express');
const app = express();
const morgan = require('morgan'); //allows developer to see what requests was made to the api
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./middlewares/authUser');
const errorHandler = require('./middlewares/errorhandler')

//import router
const productRoute = require('./routes/product')
const categoryRoute = require('./routes/category')
const userRoute = require('./routes/user')
require('dotenv/config');

//env variable
const api = process.env.API_URL

//middleware
app.use(express.json())
app.use(morgan('tiny')); //console.log the request, can be saved to a file 
app.use(cors());
app.options('*', cors());
app.use(authJwt());
//executes everytime there is an error
app.use(errorHandler);

//routes
app.use(`${api}/products`, productRoute);
app.use(`${api}/categories`, categoryRoute)
app.use(`${api}/users`, userRoute);

//connect mongodb
mongoose.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true, dbName: 'ecom'})
    .then(()=>{console.log('successfully connected to mongodb')})
    .catch((error)=>{console.log(error)});

//app listen
app.listen(3000, ()=>{
    console.log(api);
    console.log("Server listening on port 3000")});

