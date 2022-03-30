import fetch from "node-fetch"
import verifyToken from "../middleware/login.js"
import Command from "./models/CommandModel.js"
import User from './models/UserModel.js'
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import Cart from "./models/ItemModel.js"

function generateId() {
    let id = () => {
        return Math.floor((1 + Math.random() * 100000) * 0x10000)
    }
    return (id())
}

class CommandControllers {
    getCommands = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let user = jwt.verify(token, process.env.PRIVATE_KEY)
            await Command.find({"command.user": user.email})
                .then(items => {
                    res.status(200).json(items)
                })
                .catch(error => {
                    res.status(404).json({error})
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({
                success: false,
                error: "A token or a username/password is required for authentication"
            });
        }
    }

    getCommand = async (req, res) => {
        if (verifyToken(req, res)) {
            await Command.find({"command.id": req.params.id})
                .then(items => {
                    res.status(200).json(items)
                })
                .catch(error => {
                    res.status(404).json({error})
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({
                success: false,
                error: "A token or a username/password is required for authentication"
            });
        }
    }

    newCommand = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let tokenPayload = jwt.verify(token, process.env.PRIVATE_KEY)
            let emailSend = ""
            let content = {}
            let price = ""
            const transactionId = req.body.transactionId;
            let urlencoded = new URLSearchParams();
            urlencoded.append("grant_type", "client_credentials");
            let paypalAuthString = `${process.env.PAYPAL_CLIENT}:${process.env.PAYPAL_SECRET}`
            let paypalAuthBuff = new Buffer(paypalAuthString);
            let basic_auth = paypalAuthBuff.toString('base64');

            await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${transactionId}`, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${process.env.PAYPAL_APP_SECRET}`
                }
            })
                .then((response) => response.json())
                .then(async (data) => {
                    if (data.error === 'invalid_token') {
                        await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
                            method: 'post',
                            headers: {
                                'Authorization': `Basic ${basic_auth}`,
                                'User-Agent': 'PostmanRuntime/7.29.0'
                            },
                            body: urlencoded
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                process.env.PAYPAL_APP_SECRET = data.access_token
                            })
                    }
                })

            fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${transactionId}`, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${process.env.PAYPAL_APP_SECRET}`
                }
            })
                .then((response) => response.json())
                .then(async (data) => {
                    if (data.status !== 'COMPLETED') {
                        res.status(403).json({'message': 'transaction are not valid'})
                        return;
                    } else {
                        let i = 0;
                        for (const item of req.body.data) {
                            let email = item.item.user
                            let adress = ""
                            let name = ""
                            let itemName = item.item.name
                            let itemDescription = item.item.description
                            let price = item.item.price
                            await User.find({"user.email": tokenPayload.email})
                                .then(user => {
                                    adress = user[0].user.adress
                                    name = user[0].user.name
                                })
                                .catch(error => {
                                    console.log(error)
                                })
                            emailSend += `item: ${itemName} \ndescription: ${itemDescription} \nemail: ${email} \nadress: ${adress}\nname: ${name}\nprice: ${price} \n\n`
                            price += price
                            let pushContent = {}

                            let ItemId = ''
                            await Cart.find({'item.name': email})
                                .then(item=>{
                                    ItemId = item.item.id
                                })
                                .catch(err => res.status(501).json({'error': err}))

                            pushContent[ItemId] = {
                                item: itemName,
                                description: itemDescription,
                                email: email,
                                adress: adress,
                                name: name,
                                price: price,
                            }
                            Object.assign(content, pushContent)
                            i++
                        }

                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'velayismaa@gmail.com',
                                pass: 'badzacujhtjuxxwf'
                            }
                        });

                        let mailOptions = {
                            from: 'velayismaa@gmail.com',
                            to: 'velayismaa@gmail.com',
                            subject: 'Nouvelle commande !',
                            text: `OUUAAAAA ! Une nouvelle commande ! : \n${emailSend}`
                        };

                        await Command.create({
                            command: {
                                user: tokenPayload.email,
                                content: content,
                                priceTotal: price,
                                status: 'pay',
                                file: false,
                                id: generateId()
                            }
                        })

                        await transporter.sendMail(mailOptions)
                        res.status(200).json({
                            'success': true,
                            'message': 'La commande est bien passer, nous vous recontacterons pour la finaliser a l\'adresse ' + tokenPayload.email
                        })
                    }
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({
                success: false,
                error: "A token or a username/password is required for authentication"
            });
        }
    }

    cancelCommand = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let user = jwt.verify(token, process.env.PRIVATE_KEY)
            await Command.deleteOne({"command.id": req.params.id}, {"command.user": user.user})
                .then(result => res.status(200).json({result: result}))
                .catch(error => {
                    res.status(500).json({error})
                    console.log(error)
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({
                success: false,
                error: "A token or a username/password is required for authentication"
            });
        }
    }
}

export default new CommandControllers();