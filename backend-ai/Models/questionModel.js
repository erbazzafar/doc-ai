const mongoose = require ('mongoose')

const questionSchema = new mongoose.Schema({
    // user: {type: mongoose.Schema.Types.ObjectId , ref: 'User'},
    title: {type: String, required: true}
}, {
    timestamps: true
})

const questionModel = mongoose.model('Question', questionSchema)

module.exports = {
    questionModel
}