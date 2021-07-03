const express = require('express')
const router = express.Router();

const {Product} = require('../models/product')
const {Category} = require('../models/category')

router.get('/', async(req, res)=>{
    try{
        const products = await Product.find().select('name');
        if(!products) res.status(500).json({success: false, message: 'no product'});
        if(products) res.send(products)
    }catch(err){
        return res.status(404).send({success: false,  message: err.message});
    }
});

router.get('/:id', async(req, res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product) res.status(500).json({success: false, message: 'invalid product'});
        if(product) res.send(product)
    }catch(err){
        return res.status(404).send({success: false,  message: err.message});
    }
});

router.post('/', async(req, res)=>{
    //populate to get the category returned by find Id
    const category = await Category.findById(req.body.category).populate('category');
    if(!category) return res.status(400).send({success: false, message: 'invalid category'});

    try{
        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            images: req.body.images,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            brand: req.body.brand,
            price: req.body.price,
            category: category
        });
        product = await product.save();
        if(!product) return res.status(404).send({success: false, message: 'fail to create product'});
        return res.status(200).send(product);
    }catch(err){
        return res.status(404).send({success: false,  message: err.message});
    }
});

router.put('/:id', async(req, res)=>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send({success: false, message: 'invalid category'});
    try{
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: req.body.image,
                images: req.body.images,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                isFeatured: req.body.isFeatured,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
            },
            {new: true}
            )

        if(!product) return res.status(404).send({success: false, message: 'product failed to update'});
        return res.send(product)
    }catch(err){
        res.status(404).send({success: false, message: err.message});
    }

});

router.delete('/:id', async(req, res)=>{
    try{
        const product = await Product.findByIdAndRemove(req.params.id);

        if(!product) return res.status(404).send({success: false, message: 'failure to remove product'});
        return res.send({success: true, message: 'product successfully deleted'})
    }catch(err){
        res.status(404).send({success: false, message: err.message});
    }
});

//return number of products
router.get('/get/count', async(req, res)=>{
    try{
        const productCount = await Product.countDocuments((count)=>count);
        if(!productCount) return res.status(500).json({success: false, message: 'no product'});

        return res.send({total: productCount})
    }catch(err){
        return res.status(404).send({success: false,  message: err.message});
    }
});

//return features products with some counts
router.get('/get/featured/:count', async(req, res)=>{
    try{
        const count = req.params.count? req.params.count: 0;

        const featuredProducts = await Product.find({isFeatured: true}).limit(+count)
        if(!featuredProducts) return res.status(500).json({success: false, message: 'no product'});

        return res.send(featuredProducts)
    }catch(err){
        return res.status(404).send({success: false,  message: err.message});
    }
});

//get products by category
router.get('/', async(req, res)=>{

    //http://localhost:300/api/v1/products?categories=3847293,384702398
        //anything after ? is called query params
    let filter ={};
    if(req.query.categories) filter = {category: filter = req.query.categories.split(',')}
    try{
        const products = await Product.find(filter);
        if(!products) return res.status(500).json({success: false, message: 'no product'});

        return res.send(products)
    }catch(err){
        return res.status(404).send({success: false,  message: err.message});
    }
});

module.exports = router;