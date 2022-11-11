import { ConfirmationNumberOutlined } from '@mui/icons-material'
import { Chip, Grid } from '@mui/material'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import React from 'react'
import useSWR from 'swr';
import { AdminLayout } from '../../../components/layouts';
import { IOrder } from '../../../interfaces';
import { IUser } from '../../../interfaces/user';


const columns : GridColDef[] = [
    {field:'id', headerName:'Ordern ID', width:250},
    {field:'email', headerName:'Correo', width:250},
    {field:'name', headerName:'Nombre completo', width:300},
    {field:'total', headerName:'Monto total', width:300},
    {
        field:'isPaid',
        headerName:'Pagada',
        renderCell: ({row}:GridValueGetterParams)=>{
            return row.isPaid
            ? (<Chip variant='outlined' label='Pagada' color='success' />)
            : (<Chip variant='outlined' label='Pendiente' color='error' />)
        }
        
    },
    {field:'NoProducts', headerName:'N° Productos', align:'center'},
    {
        field:'check',
        headerName:'Ver orden',
        renderCell: ({row}:GridValueGetterParams)=>{
            return (
                <a href={`/admin/orders/${row.id}`} target='_blank' rel='noreferrer' >
                    Ver orden
                </a>
            )
        }
        
    },
    {field:'createdAt', headerName:'Creada en'}

];



const OrderPage = () => {

    const {data, error} = useSWR<IOrder[]>('/api/admin/orders');

    if(!data && !error){
        return <></>
    };

    const rows = data!.map(order=>({
        id: order._id,
        email:(order.user as IUser).email,
        name:(order.user as IUser).name,
        total:order.total,
        isPaid:order.isPaid,
        NoProducts:order.numberOfItems,
        createdAt:order.createdAt
    }))

    return (
        <AdminLayout 
            title={'Ordenes'} 
            subTitle={'Mantenimiento de ordenes'} 
            icon={<ConfirmationNumberOutlined/>}
        >
            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height:650, width: '100%' }}>
                    <DataGrid 
                        rows={ rows }
                        columns={ columns }
                        pageSize={ 10 }
                        rowsPerPageOptions={ [10] }
                    />

                </Grid>
            </Grid>
        </AdminLayout>
    )

}

export default OrderPage