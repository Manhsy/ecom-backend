function errorHandler(err, req, res, next){
    if(err.name === 'UnauthorizedError'){
        return res.status(500).send({message:"User is not authorized"})
    }

    if(err.name === 'ValidationError'){
        return res.status(500).send({message:"User is not authorized"})
    }
    //any other errors
    return res.status(500).send({message:err.message})
}

module.exports = errorHandler;