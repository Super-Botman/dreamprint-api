const router = require('express').Router()
const FilesControllers = require('../Controllers/FilesControllers')

router.post('/upload/:idItem', FilesControllers.upload)
router.get('/load/:idItem', FilesControllers.load)
router.get('/checkFiles', FilesControllers.checkFiles)

module.exports = router