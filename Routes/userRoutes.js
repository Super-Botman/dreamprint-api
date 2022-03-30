const router = require('express').Router()
const UserControllers = require('../Controllers/UserControllers')


router.get('/getData', UserControllers.getData)
router.post('/createAccount', UserControllers.createAccount)
router.delete('/removeAccount', UserControllers.removeAccount)
router.post('/login', UserControllers.login)
router.post('/logout', UserControllers.logout)
router.post('/sendEmail', UserControllers.sendEmail)
router.put('/changePassword', UserControllers.changePassword)
router.put('/changeEmail', UserControllers.changeEmail)
router.put('/changeAdress', UserControllers.changeAdress)

module.exports = router