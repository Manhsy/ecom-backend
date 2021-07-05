const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    }
})

//transforms _Id set by mongoose to a more readable form for frontend
categorySchema.virtual('id').get(function(){
    return this._id.toHexString();
})
//use the virtual that was set up
categorySchema.set('toJSON', {
    virtuals: true
})

const Category = mongoose.model('Category', categorySchema);
module.exports.Category = Category