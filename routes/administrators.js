var express = require('express');
var router = express.Router();
var Admin = require('../controllers/AdminController')
/* GET administrators listing. */
router.post('/login', Admin.login);
router.post('/editAdmin', Admin.editAdmin);
router.post('/editUserInfo', Admin.editUserInfo);
router.delete('/deleteAdmin', Admin.deleteAdmin);
router.post('/deleteUserAll', Admin.deleteUserAll);
router.post('/regAdmin', Admin.regAdmin);

module.exports = router;
