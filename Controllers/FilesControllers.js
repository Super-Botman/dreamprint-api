const formidable = require('formidable');
const fs = require('fs');
const verifyToken = require("../middleware/login");
const jwt = require("jsonwebtoken");
const Cart = require("./models/ItemModel")
const stl = require('stl')

class FilesControllers {
    upload = async (req, res) =>{
        if (verifyToken(req, res)) {
            const privateKey = process.env.PRIVATE_KEY
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            const tokenPayload = jwt.verify(token, privateKey);
            const io = req.app.get('socket.io');

            let idVerif = ""
            let userVerif = false

            await Cart.find({'item.id': req.params.idItem})
                .then(item => {
                    let idItem = req.params.idItem
                    idVerif = item[0].item.id
                    if (tokenPayload.email === item[0].item.user){
                        userVerif = true
                    }
                })
                .catch(error => {
                    console.log(error)
                })

            if(!idVerif){
                res.status(404).json({'error': 'item not found'})
                return;
            }

            if(!userVerif){
                res.status(403).json({'error': 'you can\'t access on this ressource'})
                return;
            }

            await fs.mkdir(`./projectsFiles/${tokenPayload.email}/${req.params.idItem}`, { recursive: true }, (err) => {
                if (err) throw err;
            });

            const options = {
                uploadDir: `./projectsFiles/${tokenPayload.email}/${req.params.idItem}`,
                keepExtensions: false
            };
            const form = new formidable.IncomingForm(options);

            form.onPart = await function (part) {
                let ext = part.originalFilename.split(".")
                for (let i = 1; i < ext.length; i++){
                    if (ext[i] !== 'stl' || part.originalFilename === ''){
                        res.status(200).json({"error": "file extension does not accept"})
                        return
                    }else{
                        this._handlePart(part);
                    }
                }
            }

            form.on('progress', function(bytesReceived, bytesExpected) {
                let progress = {
                    type: 'progress',
                    bytesReceived: bytesReceived,
                    bytesExpected: bytesExpected
                };
                io.emit('progress', progress)
            });

            await fs.readdir(`./projectsFiles/${tokenPayload.email}/${req.params.idItem}`, function(err, files) {
                if (err) {
                    console.log(err)
                } else {
                    if (files.length) {
                        files.forEach(file => {
                            fs.rmSync(`./projectsFiles/${tokenPayload.email}/${req.params.idItem}/${file}`, {
                                force: true,
                            });
                        })
                    }
                }
            });

            form.parse(req, function (err, fields, files) {
                if (err != null) {
                    console.log(err)
                    return res.status(400).json({message: err.message});
                }
                let facets = stl.toObject(fs.readFileSync(`./projectsFiles/${tokenPayload.email}/${req.params.idItem}/${files.files.newFilename}`));
                fs.writeFileSync(`./projectsFiles/${tokenPayload.email}/${req.params.idItem}/${files.files.newFilename}`, stl.fromObject(facets))

                res.json({filename: files.files.newFilename});
            });
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token is required for upload"});
        }
    }

    load = async (req, res) => {
        if (verifyToken(req, res)) {
            fs.readdir(`./projectsFiles/velayismaa@gmail.com/${req.params.idItem}`, function(err, files) {
                if (err) {
                    console.log(err)
                } else {
                    if (files.length > 1) {
                        files.forEach(file => {
                            fs.rmSync(`./projectsFiles/velayismaa@gmail.com/${req.params.idItem}/${file}`, {
                                force: true,
                            });
                        })
                    }
                    files.forEach(file => {
                        const data = fs.readFileSync(`./projectsFiles/velayismaa@gmail.com/${req.params.idItem}/${file}`, 'utf8')
                        res.status(200).json({'data': data})
                    })
                }
            });
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token is required for upload"})
        }
    }

    checkFiles = async (req, res) => {
        if (verifyToken(req, res)) {
            const privateKey = process.env.PRIVATE_KEY
            const token = req.body.token || req.query.token || req.headers["x-access-token"];
            const tokenPayload = jwt.verify(token, privateKey);

            fs.readdir(`./projectsFiles/${tokenPayload.email}`, function(err, files) {
                if (err) {
                    console.log(err)
                } else {
                    res.status(200).json({'data': files})
                }
            });
        } else if (!verifyToken(req, res)) {
            res.status(401).json({success: false, error: 'token not valid'});
        } else {
            res.status(403).json({success: false, error:"A token is required for upload"})
        }
    }
}

module.exports = new FilesControllers()
