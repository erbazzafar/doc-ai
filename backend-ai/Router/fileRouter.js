const express = require ('express')
const upload = require("../middleware/multer");
const { uploadFile, fileSummary } = require('../Controller/fileController');

const fileRouter = express.Router()

fileRouter.post('/upload', upload.single('file'), uploadFile)
fileRouter.post('/summary', upload.single('file'), fileSummary)

module.exports = fileRouter