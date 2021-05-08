var express = require('express');
var router = express.Router();
var Admin = require('../controllers/AdminController')
/* GET administrators listing. */
router.post('/login', Admin.login);
router.post('/editAdmin', Admin.editAdmin);
router.post('/regAdmin', Admin.regAdmin);
router.post('/editUserInfo', Admin.editUserInfo);
router.delete('/deleteAdmin', Admin.deleteAdmin);
router.delete('/deleteUserAll', Admin.deleteUserAll);
router.delete('/deleteUserInfo', Admin.deleteUserInfo);
router.post('/regWarningTriangle', Admin.regWarningTriangle);
router.post('/editWarningTriangle', Admin.editWarningTriangle);
router.post('/editUserEquip', Admin.editUserEquip);
router.put('/editOnoff', Admin.editOnoff);
router.delete('/deleteWarningTriangle', Admin.deleteWarningTriangle);

module.exports = router;
