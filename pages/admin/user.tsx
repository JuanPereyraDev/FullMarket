import { PeopleOutline } from '@mui/icons-material'
import { Grid, MenuItem, Select } from '@mui/material'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layouts'
import useSWR from 'swr';
import { IUser } from '../../interfaces'
import { tesloApi } from '../../api'
//import { useRouter } from 'next/router'

const UserPage = () => {

    const {data, error} = useSWR<IUser[]>('/api/admin/users'); 

    const [users, setUsers] = useState<IUser[]>([]);
    
    //const router = useRouter();
    
    useEffect(() => {
        if(data){
            setUsers(data)
        }
    }, [data])


    if(!data && !error){
        return <></>
    };

    const onRoleUpdate = async  (id:string, newRole:string) => {

        const prevUser = users.map(user=>({...user}));

        const updateUsers = users.map(user=>({
            ...user,
            role:id===user._id?newRole:user.role
        }));

        setUsers(updateUsers);

        try {
            await tesloApi.put('/admin/users', {
                id, role:newRole
            });



            //router.reload();
        } catch (error) {
            alert('No se puedo efectuar la actualizacion');
            setUsers(prevUser)
            console.log(error)
        }
    }

    const columns: GridColDef[] = [
        {field:'email', headerName:'Correo', width:250},
        {field:'name', headerName:'Nombre completo', width:300},
        {
            field:'role',
            headerName:'Rol', 
            width:300,
            renderCell:({row}:GridValueGetterParams)=>{
                return(
                    <Select
                        value={row.role}
                        label='Rol'
                        onChange={({target})=>onRoleUpdate(row.id, target.value)}
                        sx={{width:'300px'}}
                    >
                        <MenuItem value='ADMIN'>Admin</MenuItem>
                        <MenuItem value='CLIENT'>Client</MenuItem>
                    </Select>
                )
            }
        },
    ];

    const rows = data!.map(user=>({
        id:user._id,
        email:user.email,
        name:user.name,
        role:user.role
    }));


    return (
        <AdminLayout
            title='Usuarios'
            subTitle='Mantenimiento de Usuarios'
            icon={<PeopleOutline />}
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

export default UserPage