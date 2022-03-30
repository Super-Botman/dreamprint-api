const Item = require("./models/ItemModel");
const User = require("./models/UserModel");
const verifyToken = require("../middleware/login");
const jwt = require("jsonwebtoken");
let nodemailer = require('nodemailer');

function generateId() {
    let id = () => {
        return Math.floor((1 + Math.random() * 100000) * 0x10000)
    }
    return (id())
}

class CartControllers {
    getItems = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let user = jwt.verify(token, process.env.PRIVATE_KEY)
            await Item.find({"item.user": user.email})
                .then(items => {
                    res.status(200).json(items)
                })
                .catch(error => {
                    res.status(404).json({error})
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    newItem = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let user = jwt.verify(token, process.env.PRIVATE_KEY)
            await Item.create({
                item: {
                    user: user.email,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    id: generateId()
                }
            })
                .then(result => res.status(200).json(result.item))
                .catch(error => {
                    res.status(403).json({error})
                    console.log(error)
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    deleteItem = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let user = jwt.verify(token, process.env.PRIVATE_KEY)
            await Item.deleteOne({"item.name": req.body.item},{"item.user": user.user})
                .then(result => res.status(200).json({result: result}))
                .catch(error => {
                    res.status(500).json({error})
                    console.log(error)
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    deleteAll = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let user = jwt.verify(token, process.env.PRIVATE_KEY)
            await Item.deleteMany({"item.user": user.user})
                .then(result => res.status(200).json({result: result}))
                .catch(error => {
                    res.status(500).json({error})
                    console.log(error)
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }
}

module.exports = new CartControllers()