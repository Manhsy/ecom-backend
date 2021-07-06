const express = require('express')
const router = express.Router();
const multer = require('multer') //for image uploading

const {Product} = require('../models/product')
const {Category} = require('../models/category')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');

      if(isValid) uploadError = null
      cb(uploadError, 'public/uploads') //every upload image will be stored here
    },
    filename: function (req, file, cb) {
        
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
   
const upload = multer({ storage: storage })


router.get('/api/v1/products', async(req, res)=>{
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

router.post('/', upload.single('image'), async(req, res)=>{

    try{
        //populate to get the category returned by find Id
        const category = await Category.findById(req.body.category).populate('category');
        if(!category) return res.status(400).send({success: false, message: 'invalid category'});

        const file = req.file;
        if(!file) return res.send('request must include image');
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${basePath}${fileName}`,
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


router.put('/:id', upload.single('image'), async(req, res)=>{

    try{
        const category = await Category.findById(req.body.category);
        if(!category) return res.status(400).send({success: false, message: 'invalid category'});

        const product = await Product.findById(req.params.id);
        if(!product)return res.status(400).send({success: false, message: 'invalid product'});

        const file = req.file;
        let imagePath;

        if(file){
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            imagePath = `${basePath}${fileName}`
        }else{
            imagePath = product.image;
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: imagePath,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                isFeatured: req.body.isFeatured,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
            },
            {new: true}
        )

        if(!updatedProduct) return res.status(404).send({success: false, message: 'product failed to update'});
        return res.send(updatedProduct)
    }catch(err){
        res.status(404).send({success: false, message: err.message});
    }

});

//uploading multiple images to a product
router.put('/gallery-images/:id', upload.array('images'), async(req, res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product)return res.status(400).send({success: false, message: 'invalid product'});
        
        let imagesPaths = [];
        const files = req.files;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
 
        if(files){
            files.map(file=>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            {
                images: imagesPaths
            },
            {new: true}
        )

        if(!updatedProduct) return res.status(404).send({success: false, message: 'product failed to update'});
        return res.send(updatedProduct)

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