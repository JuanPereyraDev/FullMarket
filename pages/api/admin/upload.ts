import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs'
import formidable from 'formidable';
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config(process.env.CLOUDINARY_URL || '');

type Data = {
    message: string
}

export const config = {
    api:{
        bodyParser : false
    }
};

const saveFile = async (file:formidable.File):Promise<string>=> {

    //const data = fs.readFileSync(file.filepath);//info del archivo
    //fs.writeFileSync(`./public/${file.originalFilename}`, data);//creamos el archivo en un path con su info correspondiente
    //fs.unlinkSync(file.filepath);//eliminamos el archivo que se encuentra en ese path
    //return;

    const {secure_url} = await cloudinary.uploader.upload(file.filepath);
    return secure_url;
}

const parseFile = async (req:NextApiRequest):Promise<string> => {

    return new Promise ( (resolve, reject)=>{
        const form = new formidable.IncomingForm();
        form.parse(req, async (err,fields, files)=>{

            if(err){
                return reject(err)
            };

            const fileUrl = await saveFile(files.file as formidable.File)

            resolve(fileUrl)

        })
    } )
    

}

export default async function (req: NextApiRequest, res: NextApiResponse<Data>) {

    if(req.method !== 'POST')return res.status(400).json({message:'Bad request'});

    const fileUrl = await parseFile(req);

    res.status(200).json({ message: fileUrl })
}