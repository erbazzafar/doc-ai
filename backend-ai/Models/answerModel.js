const mongoose = require ('mongoose')

const answerSchema = new mongoose.Schema({
    // user: {type: mongoose.Schema.Types.ObjectId , ref: 'User'},
    questionId: {type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true},
    answer: {type: String, required: true}
}, {
    timestamps: true
})

const answerModel = mongoose.model('Answer', answerSchema)

module.exports = {
    answerModel
}
