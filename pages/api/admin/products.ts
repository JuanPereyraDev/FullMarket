import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { Product } from '../../../models';
import { IProduct } from '../../../interfaces/products';
import { isValidObjectId } from 'mongoose';
import {v2 as cloudinary} from 'cloudinary';
cloudinary.config(process.env.CLOUDINARY_URL || '');



type Data = | {message: string} | IProduct[] | IProduct

export default async function handler (req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getProducts(req, res);
        
            case 'POST':
                return postProducts(req, res);

            case 'PUT':
                return putProducts(req, res);
    
        default:
            return res.status(400).json({message:'Bad request'});
    }

};


const getProducts = async (req:NextApiRequest, res:NextApiResponse) => {

    await db.connect();

    const products = await Product.find().sort({title:'asc'}).lean();

    await db.disconnect();

    const updateProdcuts = products.map(product => {
        product.images = product.images.map(img=>{
            return img.includes('http') ? img : `${process.env.HOST_NAME}products/${img}`
        })
        return product;
    })

    return res.status(200).json(updateProdcuts)
};

const putProducts = async (req:NextApiRequest, res:NextApiResponse) => {

    const {_id, images} = req.body as IProduct;

    if(!isValidObjectId(_id)){
        return res.status(400).json({
            message:'El Id no es valido'
        });
    };

    if(images.length < 2 ){
        return res.status(400).json({
            message:'Deben ser dos imagenes'
        })
    };

    try {

        await db.connect();

        const product = await Product.findById(_id);

        await db.disconnect()

        if(!product){

            await db.disconnect()
            return res.status(400).json({
                message:'El producto no existe'
            })

        };

        product.images.forEach(async (img) =>{
            if(!images.includes(img)){
                const [fileId, extension] = img.substring(img.lastIndexOf('/') + 1).split('.');
                await cloudinary.uploader.destroy(fileId);
            }
        })

        await product.update(req.body);

        return res.status(200).json(product);

    } catch (error) {
        await db.disconnect()
    }

};

const postProducts = async  (req:NextApiRequest, res:NextApiResponse) => {

    const {images=[]}=req.body as IProduct;

    if(images.length < 2){
        return res.status(400).json({
            message:'Deben ser dos las imagenes'
        })
    };

    try {
        await db.connect();

        const productInDb = await Product.findOne({slug:req.body.slug});
        
        if(productInDb){
            await db.disconnect();
            return res.status(400).json({message:'Ya existe un producto con el mismo slug'})
        };

        const product = new Product(req.body);

        await product.save();

        await db.disconnect();

        return res.status(201).json(product);

    } catch (error) {
        await db.disconnect();
        console.log(error)
        return res.status(400).json({
            message:'Revisar logs del servior '
        });
    }
};