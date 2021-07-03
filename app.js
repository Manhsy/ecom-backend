//npm imports
const express = require('express');
const app = express();
const morgan = require('morgan'); //allows developer to see what requests was made to the api
const mongoose = require('mongoose');
const cors = require('cors');

//import router
const productRoute = require('./routes/product')
const categoryRoute = require('./routes/category')
require('dotenv/config');

//env variable
const api = process.env.API_URL

//middleware
app.use(express.json())
app.use(morgan('tiny')); //console.log the request, can be saved to a file 
app.use(cors());
app.options('*', cors());

//routes
app.use(`${api}/products`, productRoute);
app.use(`${api}/categories`, categoryRoute)

//connect mongodb
mongoose.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true, dbName: 'ecom'})
    .then(()=>{console.log('successfully connected to mongodb')})
    .catch((error)=>{console.log(error)});

//app listen
app.listen(3000, ()=>{
    console.log(api);
    console.log("Server listening on port 3000")});
