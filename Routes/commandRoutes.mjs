import CommandControllers from '../Controllers/CommandControllers.mjs'
import express from "express";
const router = express.Router()


router.get('/getCommands', CommandControllers.getCommand)
router.get('/getCommand/:id', CommandControllers.getCommands)
router.post('/newCommand', CommandControllers.newCommand)
router.delete('/deleteCommand/:id', CommandControllers.cancelCommand)

export default router