import { getToken } from 'next-auth/jwt';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';




export async function middleware (req:NextRequest | any , ev:NextFetchEvent){

    const session:any = getToken({req, secret:process.env.NEXTAUTH_SECRET || ''});
    
    if(!session){
        return new Response(JSON.stringify({message:'No autorizado'}), {
            status:401,
            headers:{
                'Content-Type': 'applitacion/json'
            }
        });
    };

    if(session.user.role !== 'ADMIN'){
        return new Response(JSON.stringify({message:'No autorizado'}), {
            status:401,
            headers:{
                'Content-Type': 'applitacion/json'
            }
        });
    };

    return NextResponse.next();

}