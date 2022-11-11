import { isValidObjectId } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { IUser } from '../../../interfaces';
import { User } from '../../../models';

type Data = { message: string } | IUser[]

export default function (req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getUsers(req, res);

        case 'PUT':
        return putUsers(req, res);

        default:
            return res.status(400).json({ message: 'Bad request' })
    }

};


const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {

    await db.connect();

    const users = await User.find().select('-password').lean();

    await db.disconnect();

    return res.status(200).json(users)


};

const putUsers = async (req: NextApiRequest, res: NextApiResponse) => {
    const {userId='', role=''} = req.body;

    if( !isValidObjectId(userId) ){
        return res.status(400).json({ message: 'No existe usuario con ese Id' })
    };

    const validRole = ['ADMIN', 'CLENT'];

    if(!validRole.includes(role)){
        return res.status(400).json({ message: 'El rol no es permitido, roles permitidos son:'+ validRole.join(':') })
        
    };

    await db.connect();

    const user = await User.findById(userId);

    if(!user){
        return res.status(400).json({ message: 'No existe usuario con ese Id' })
    };

    user.role=role;

    await user.save()

    await db.disconnect();

    return res.status(200).json({message:'Actualizacion exitosa!'})
};
