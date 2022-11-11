import NextLink from 'next/link';
import { AddOutlined, CategoryOutlined } from '@mui/icons-material'
import {  Box, Button, CardMedia, Grid, Link } from '@mui/material'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import React from 'react'
import useSWR from 'swr';
import { AdminLayout } from '../../../components/layouts';
import { IProduct } from '../../../interfaces/products';


const columns : GridColDef[] = [
    {field:'img', headerName:'Foto', renderCell:({row}:GridValueGetterParams)=>{
        return(
            <a href={`/product/${row.slug}`} target='_blank' rel='noreferrer' >
                <CardMedia
                    component='img'
                    alt={`${row.title}`}
                    className='fadeIn'
                    image={row.img}
                />
            </a>
        )
    }},
    {
    field:'title', 
    headerName:'Titulo',
    width:250,
    renderCell:({row}:GridValueGetterParams)=>{
        return(
            <NextLink href={`/admin/products/${row.slug}`} passHref>
                <Link underline='always'>
                    {row.title}
                </Link>
            </NextLink>
        )
    }
},
    {field:'gender', headerName:'Genero'},
    {field:'type', headerName:'Tipo'},
    {field:'inStock', headerName:'Inventario'},
    {field:'price', headerName:'Precio'},
    {field:'size', headerName:'Tallas', width:250}

];



const ProductsPage = () => {

    const {data, error} = useSWR<IProduct[]>('/api/admin/products');

    if(!data && !error){
        return <></>
    };

    const rows = data!.map(product=>({
        id:product._id,
        img:product.images[0],
        title:product.title,
        gender:product.gender,
        type:product.type,
        inStock:product.inStock,
        price:product.price,
        size:product.sizes.join(', '),
        sluw:product.slug
    }))

    return (
        <AdminLayout 
            title={'Products'+ data?.length} 
            subTitle={'Mantenimiento de products'} 
            icon={<CategoryOutlined/>}
        >
            <Box display='flex' justifyContent='end' sx={{mb:2}}>
                <Button
                    startIcon={<AddOutlined/>}
                    color='secondary'
                    href='/admin/products/new'
                >
                    Crear producto
                </Button>
            </Box>
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

export default ProductsPage