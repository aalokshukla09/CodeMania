const express = require('express');
const { register, login, logout, adminRegister } = require('../controller/Authcontroller');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/logout',userMiddleware, logout);
router.post('/admin/register',adminMiddleware, adminRegister);


module.exports = router;