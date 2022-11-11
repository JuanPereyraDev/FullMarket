import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database'
import { IOrder } from '../../../interfaces'
import { Order } from '../../../models'

type Data = {message: string} | IOrder[]

export default async function (req: NextApiRequest, res: NextApiResponse<Data>) {

    if(req.method!=='GET') return res.status(400).json({message:'Bad request'})

    await db.connect();

    const orders = await Order.find()
    .sort({createdAt:'desc'})
    .populate('user', 'name, email')
    .lean();

    await db.disconnect();

    res.status(200).json(orders)
}