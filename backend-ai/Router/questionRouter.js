const express = require("express")
const { sendMessageToAi } = require("../Controller/questionController")

const questionRouter = express.Router()

questionRouter.post('/ask', sendMessageToAi)

module.exports = questionRouter