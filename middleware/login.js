const jwt = require("jsonwebtoken");
require('dotenv').config()

const verifyToken = (req, res) => {
    const privateKey = process.env.PRIVATE_KEY
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token){
        return false;
    }
    try {
        const decoded = jwt.verify(token, privateKey);
        req.user = decoded;
        return true;
    } catch (err) {
        return false;
    }
};

module.exports = verifyToken;