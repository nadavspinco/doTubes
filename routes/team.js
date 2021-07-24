const express = require('express');

const router = express.Router();

const controller = require('../controllers/team');

const isAuth = require('../middleware/is-Auth');

const {body} = require('express-validator/check')

router.post('/',[body('teamName')
.trim()
.not()
.isEmpty()],isAuth,controller.addTeam);

module.exports = router;