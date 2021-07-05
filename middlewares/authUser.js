const expressJwt = require('express-jwt');

//every API called made will be authenticated through this function 
//excluding the login and register path
//and GET & OPTIONS requests
function authJwt(){
    const api = process.env.API_URL;
    const secret = process.env.jwtSecret;
    return expressJwt({
        secret, 
        algorithms: ['HS256'],
        //cannot access unless user has payload of admin
        isRevoked: isRevoked
    }).unless({
        path: [
            //every user can access these 2 paths
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            //no need token
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

//done
async function isRevoked(req, payload, done){
    if(!payload.isAdmin) return done(null, true) //if user not admin, return a reject
    return done() //else return good
}

module.exports = authJwt;