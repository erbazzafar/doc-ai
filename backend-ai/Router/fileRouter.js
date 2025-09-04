const express = require ('express')
const upload = require("../middleware/multer");
const { uploadFile } = require('../Controller/fileController');

const fileRouter = express.Router()

fileRouter.post('/upload', upload.single('file'), uploadFile)

module.exports = fileRouter