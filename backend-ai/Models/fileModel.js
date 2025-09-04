const mongoose = require ('mongoose')

const fileSchema = new mongoose.Schema({
    // user: {type: mongoose.Schema.Types.ObjectId , ref: 'User'},
    file: {type: String, required: true},
    summary: {type: String, required: true}
}, {
    timestamps: true
})

const fileModel = mongoose.model('File', fileSchema)

module.exports = {
    fileModel
}