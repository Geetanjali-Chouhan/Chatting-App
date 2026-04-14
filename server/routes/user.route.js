import express from 'express'
import {  login, register } from '../controllers/user.controller.js';


const router = express.Router();
router.post('/register',register)
router.get('/login',login)

{/*middleware*/}

export default router;