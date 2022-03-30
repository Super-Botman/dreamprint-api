const router = require('express').Router()
const CartControllers = require('../Controllers/CartControllers')

router.get('/getItems', CartControllers.getItems)
router.post('/newItem', CartControllers.newItem)
router.delete('/deleteItem', CartControllers.deleteItem)
router.delete('/deleteAll', CartControllers.deleteAll)

module.exports = router