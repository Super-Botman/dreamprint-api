const User = require('./models/UserModel')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const verifyToken = require("../middleware/login");
let nodemailer = require('nodemailer');

class UsersControllers {
    createAccount = async (req, res) => {
        const oldUsername = await User.find({"user.name": req.body.name})
        const oldEmail = await User.find({"user.email": req.body.email})
        if(oldUsername[0] !== undefined || oldEmail[0] !== undefined){
            res.status(200).json({"error": "username or email don't allow"});
        }else{
            const privateKey = process.env.PRIVATE_KEY
            const userToken = jwt.sign(
                {email: req.body.email},
                privateKey,
                {
                    expiresIn: "2h",
                }
            );
            await User.create({
                user: {
                    password: bcrypt.hashSync(req.body.password, saltRounds),
                    email: req.body.email,
                    name: req.body.name,
                    adress: req.body.adress,
                    token: userToken,
                    role: "buyer"
                }
            })
                .then(result => res.status(200).json(result.user))
                .catch(error => {
                    res.status(403).json({error})
                    console.log(error)
                })
        }
    }

    removeAccount = async (req, res) => {
        if (verifyToken(req, res)) {
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            let user = jwt.verify(token, process.env.PRIVATE_KEY)
            await User.deleteOne({"user.user": user.user})
                .then(result => res.status(200).json(result))
                .catch(error => {
                    res.status(500).json({error})
                    console.log(error)
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'passwords do not match'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    login = async (req, res) => {
        if(req.body.email) {
            await User.findOne({"user.email": req.body.email})
                .then(user => {
                    bcrypt.compare(req.body.password, user.user.password, function (err, response) {
                        if (response) {
                            const privateKey = process.env.PRIVATE_KEY
                            const token = jwt.sign(
                                {email: req.body.email},
                                privateKey,
                                {
                                    expiresIn: "2h",
                                }
                            );
                            user.user.token = token
                            return res.status(200).json({
                                success: true,
                                message: 'passwords match',
                                token: user.user.token
                            });
                        } else {
                            return res.status(403).json({success: false, error: 'passwords do not match'});
                        }
                    })
                })
                .catch(error => {
                    res.status(500).json({error})
                })
        }else if (verifyToken(req, res)) {
            const privateKey = process.env.PRIVATE_KEY
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            const tokenContent = jwt.verify(token, privateKey);
            await User.findOne({"user.email": tokenContent.email})
                .then(user => {
                    if (user) {
                        const privateKey = process.env.PRIVATE_KEY
                        const token = jwt.sign(
                            {email: tokenContent.email},
                            privateKey,
                            {
                                expiresIn: "2h",
                            }
                        );
                        user.user.token = token
                        return res.status(200).json({
                            success: true,
                            message: 'token is ok',
                            token: user.user.token
                        });
                    } else {
                        return res.status(403).json({success: false, error: 'user do not find in the db'});
                    }
                })
                .catch(error => {
                    res.status(500).json({error})
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    logout = async (req, res) => {
        if (verifyToken(req, res)) {
            const privateKey = process.env.PRIVATE_KEY
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            const username = jwt.verify(token, privateKey);
            await User.findOne({"user.email": username.email})
                .then(user => {
                    User.updateOne({"user.email": username.email}, {
                        $set: {
                            user: {
                                name: user.user.name,
                                password: user.user.password,
                                email: user.user.email,
                                adress: user.user.adress,
                                token: user.user.token,
                                role: user.user.role
                            }
                        },
                    })
                        .catch(error => {
                            res.status(500).json({error})
                        })
                    return res.status(200).json({success: true, user: user});
                })
                .catch(error => {
                    res.status(403).json({error})
                })
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    changePassword = async (req, res) => {
        const privateKey = process.env.PRIVATE_KEY
        const token = req.body.token;
        const email = jwt.verify(token, privateKey);
        const oldCryptedPassword = await User.find({"user.email": email.email})
        const passwordCrypted = bcrypt.hashSync(req.body.password, saltRounds)
        if(oldCryptedPassword[0].user.password === passwordCrypted){
            res.status(200).json({"error": "password don't allow"});
        }else {
            if(await User.findOne({"user.changePassToken": req.body.token})){
                const docs = await User.findOne({"user.changePassToken": req.body.token});
                await User.updateOne({"user.changePassToken": req.body.token}, {
                    $set: {
                        user: {
                            name: docs.user.name,
                            password: bcrypt.hashSync(req.body.password, saltRounds),
                            email: docs.user.email,
                            adress: docs.user.adress,
                            token: docs.user.token,
                            role: docs.user.role
                        }
                    }
                })
                    .then(result => res.status(200).json({"result": "true"}))
                    .catch(error => {
                        res.status(403).json({error})
                        console.log(error)
                    })
            }else{
                res.status(401).json({"result":"false","token":"expire"})
            }
        }
    }

    sendEmail = async (req, res) => {
        const privateKey = process.env.PRIVATE_KEY
        const forgotPassToken = jwt.sign(
            {email: req.body.email},
            privateKey,
            {
                expiresIn: "1h",
            }
        );
        let liens = `http://localhost:63342/dreamprint-site/forgotPass.html?token=${forgotPassToken}`
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'velayismaa@gmail.com',
                pass: 'badzacujhtjuxxwf'
            }
        });

        let mailOptions = {
            from: 'velayismaa@gmail.com',
            to: req.body.email,
            subject: 'Change your password !',
            text: `Hé salut en fait c'était sur que t'aller utiliser le petit liens changer ton mot de passe donc t'ais préparer un petit liens : ${liens}`
        };

        transporter.sendMail(mailOptions)
        await User.findOne({"user.email": req.body.email})
            .then(user => {
                User.updateOne({"user.email": req.body.email}, {
                    $set: {
                        user: {
                            name: user.user.name,
                            password: user.user.password,
                            email: user.user.email,
                            adress: user.user.adress,
                            token: user.user.token,
                            role: user.user.role,
                            changePassToken: forgotPassToken
                        }
                    }
                })
                    .then((update) => {
                        res.status(200).json({'return':'email is send'})
                    })
                    .catch(error => {
                        res.status(500).json({error})
                    })
            })
            .catch(error => {
                res.status(403).json({"error":"email don't find"})
                return;
            })
    }

    changeEmail = async (req, res) => {
        if (verifyToken(req, res)) {
            const oldEmail = await User.find({"user.email": req.body.email})
            if(oldEmail[0].user.email === req.body.newEmail){
                res.status(200).json({"error": "email don't allow"});
            }else {
                const docs = await User.findOne({"user.email": req.body.email});
                await User.updateOne({"user.email": req.body.email}, {
                    $set: {
                        user: {
                            name: docs.user.name,
                            password: docs.user.password,
                            email: req.body.email,
                            adress: docs.user.adress,
                            token: docs.user.token,
                            role: docs.user.role
                        }
                    },
                })
                    .then(result => res.status(200).json({"result":"success"}))
                    .catch(error => {
                        res.status(403).json({error})
                        console.log(error)
                    })
            }
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'passwords do not match'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    changeAdress = async (req, res) => {
        if (verifyToken(req, res)) {
            const oldEmail = await User.find({"user.email": req.body.email})
            if(oldEmail[0].user.email === req.body.newEmail){
                res.status(200).json({"error": "email don't allow"});
            }else {
                const docs = await User.findOne({"user.email": req.body.email});
                await User.updateOne({"user.email": req.body.email}, {
                    $set: {
                        user: {
                            name: docs.user.name,
                            password: docs.user.password,
                            email: docs.user.adress,
                            adress: req.body.adress,
                            token: docs.user.token,
                            role: docs.user.role
                        }
                    },
                })
                    .then(result => res.status(200).json({"result":"success"}))
                    .catch(error => {
                        res.status(403).json({error})
                        console.log(error)
                    })
            }
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'passwords do not match'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }

    getData = async (req,res) => {
        if (verifyToken(req, res)) {
            const privateKey = process.env.PRIVATE_KEY
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            const username = jwt.verify(token, privateKey);
            await User.findOne({"user.email": username.email})
                .then(user => {
                    if (user) {
                        return res.status(200).json({
                            name: user.user.name,
                            email: user.user.email,
                            adress: user.user.adress,
                            role: user.user.role
                        });
                    } else {
                        return res.status(403).json({success: false, message: 'user do not find in the db'});
                    }
                })
                .catch(error => {
                    res.status(500).json({error})
                })
        }else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'passwords do not match'});
        } else {
            res.status(403).json({success: false, error:"A token or a username/password is required for authentication"});
        }
    }
}

module.exports = new UsersControllers()