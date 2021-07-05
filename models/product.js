const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    richDescription:{
        type: String,
        default: ''
    },
    image:{
        type: String,
        default: ''
    },
    images: [
        {
            type:String
        }
    ],
    countInStock: {
        type: Number,
        min: 0,
        max: 255
    },
    rating: {
        type: Number
    },
    isFeatured:{
        type: Boolean
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    brand: {
        type: String,
        default: ''
    },
    price:{
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});

//transforms _Id set by mongoose to a more readable form for frontend
productSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
//use the virtual that was set up
productSchema.set('toJSON', {
    virtuals: true
})

const Product = mongoose.model('Product', productSchema);

module.exports.Product=Product;