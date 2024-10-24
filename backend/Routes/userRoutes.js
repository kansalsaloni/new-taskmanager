const express = require('express');
const {newUser,Login,updateUser} =require('../Controller/userController');
const auth = require('../Middleware/auth');

const router = express.Router(); 

router.post('/signup', newUser);
router.post('/login', Login); 
router.put('/update',auth,updateUser)

module.exports = router;