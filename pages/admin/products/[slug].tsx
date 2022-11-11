import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { GetServerSideProps } from 'next'
import { AdminLayout } from '../../../components/layouts'
import { IProduct } from '../../../interfaces';
import { DriveFileRenameOutline, SaveOutlined, UploadOutlined } from '@mui/icons-material';
import { dbProducts } from '../../../database';
import { Box, Button, capitalize, Card, CardActions, CardMedia, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, ListItem, Paper, Radio, RadioGroup, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { tesloApi } from '../../../api';
import { Product } from '../../../models';
import { useRouter } from 'next/router';


const validTypes  = ['shirts','pants','hoodies','hats']
const validGender = ['men','women','kid','unisex']
const validSizes = ['XS','S','M','L','XL','XXL','XXXL']

interface Props {
    product: IProduct;
};

interface FormData {
    _id?: string;
    description: string;
    images: string[];
    inStock: number;
    price: number;
    sizes: string[];
    slug: string;
    tags: string[];
    title: string;
    type: string;
    gender: string
}

const ProductAdminPage:FC<Props> = ({ product }) => {

    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);

    const {handleSubmit, register, formState:{errors}, getValues, setValue, watch} = useForm<FormData>({
        defaultValues:product
    });

    const [tag, setTag] = useState('');

    useEffect(() => {

    const suscription = watch((value, {name,type})=>{

        if(name === 'title'){

            const newSlug = value.title?.trim().replaceAll(' ', '-').replaceAll("'", '').toLowerCase() || '';

            setValue('slug', newSlug, {shouldValidate:true})
        }
    });

    return ()=> suscription.unsubscribe();

    }, [watch, setValue]);

    const onFilesSelected = async ({target}:ChangeEvent<HTMLInputElement>) => {
        
        if(!target.files || target.files.length === 0 ) return;

        for (const file of target.files) {
            const dataFile = new FormData();
            dataFile.append('img',file );
            const {data}=await tesloApi.post('/admin/upload', dataFile);
            setValue('images', [...getValues('images'), data.message],{shouldValidate:true});
        }

    };

    const onDeleteImg = (imge:string) => {
        setValue('images', getValues('images').filter(img=>img !== imge), {shouldValidate:true});

    }
    

    const onSubmit =async (formData:FormData) =>{

        if( product.images.length< 2 )return alert('minimo 2 imagenes');

        setIsSaving(true);

        try {

        const {data} = await tesloApi({
            url:'/admin/products',
            method:formData._id ? 'PUT' : 'POST',
            data:formData
        });

            if(!formData._id){
                router.replace(`admin/products/${formData.slug}`);
            }else(
                setIsSaving(false)
            )

        } catch (error) {

            setIsSaving(false)

        }

    };

    const newTag = () => {

        if(getValues('tags').includes(tag)){
            setTag('');
            return;
        }

        getValues('tags').unshift(tag)
    };

    const onDeleteTag = ( tag: string ) => {

        const tags = getValues('tags');
        
        tags.filter(t => t !==tag); 

        setValue('tags', tags, {shouldValidate:true})
    };

    const onChangeSize = (size:string) => {
        const currentSize = getValues('sizes');

        if(currentSize.includes(size)){
            return setValue('sizes', currentSize.filter(s=>s!==size), {shouldValidate:true})
        }

        setValue('sizes', [...currentSize, size], {shouldValidate:true})
    }

    return (
        <AdminLayout 
            title={'Producto'} 
            subTitle={`Editando: ${ product.title }`}
            icon={ <DriveFileRenameOutline /> }
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
            >
                <Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
                    <Button 
                        color="secondary"
                        startIcon={ <SaveOutlined /> }
                        sx={{ width: '150px' }}
                        type="submit"
                        disabled={ isSaving }
                        >
                        Guardar
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {/* Data */}
                    <Grid item xs={12} sm={ 6 }>

                        <TextField
                            label="Título"
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('title', {
                                required: 'Este campo es requerido',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={ !!errors.title }
                            helperText={ errors.title?.message }
                        />

                        <TextField
                            label="Descripción"
                            variant="filled"
                            fullWidth 
                            multiline
                            sx={{ mb: 1 }}
                            { ...register('description', {
                                required: 'Este campo es requerido',
                            })}
                            error={ !!errors.description }
                            helperText={ errors.description?.message }
                        />

                        <TextField
                            label="Inventario"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('inStock', {
                                required: 'Este campo es requerido',
                                min:{value:0, message:'Minimo es 0'}
                            })}
                            error={ !!errors.inStock }
                            helperText={ errors.inStock?.message }
                        />
                        
                        <TextField
                            label="Precio"
                            type='number'
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            { ...register('price', {
                                required: 'Este campo es requerido',
                                min:{value:0, message:'Minimo es 0'}
                            })}
                            error={ !!errors.price }
                            helperText={ errors.price?.message }
                        />

                        <Divider sx={{ my: 1 }} />

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Tipo</FormLabel>
                            <RadioGroup
                                row
                                value={ getValues('type') }
                                onChange={ ({target})=> setValue('type', target.value, {shouldValidate:true}) }
                            >
                                {
                                    validTypes.map( option => (
                                        <FormControlLabel 
                                            key={ option }
                                            value={ option }
                                            control={ <Radio color='secondary' /> }
                                            label={ capitalize(option) }
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Género</FormLabel>
                            <RadioGroup
                                row
                                {...register('gender')}
                                value={ getValues('gender') }
                                onChange={ ({target})=>setValue('gender', target.value, {shouldValidate:true}) }
                            >
                                {
                                    validGender.map( option => (
                                        <FormControlLabel 
                                            key={ option }
                                            value={ option }
                                            control={ <Radio color='secondary' /> }
                                            label={ capitalize(option) }
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormGroup>
                            <FormLabel>Tallas</FormLabel>
                            {
                                validSizes.map(size => (
                                    <FormControlLabel 
                                        key={size} 
                                        control={<Checkbox checked={getValues('sizes').includes(size)} />} 
                                        label={ size } 
                                        onChange={()=>onChangeSize(size)}
                                    />
                                ))
                            }
                        </FormGroup>

                    </Grid>

                    {/* Tags e imagenes */}
                    <Grid item xs={12} sm={ 6 }>
                        <TextField
                            label="Slug - URL"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            { ...register('slug', {
                                required: 'Este campo es requerido',
                                validate:(val)=>val.trim().includes(' ') ? 'No se puede colocar espacio en blanco' : undefined  
                            })}
                            error={ !!errors.slug }
                            helperText={ errors.slug?.message }
                        />

                        <TextField
                            label="Etiquetas"
                            variant="filled"
                            fullWidth 
                            sx={{ mb: 1 }}
                            helperText="Presiona [spacebar] para agregar"
                            name='tag'
                            value={tag}
                            onChange={({target})=>setTag(target.value)}
                            onKeyUp={({code})=> code==='Space' ? newTag() : undefined}
                        />
                        
                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            p: 0,
                            m: 0,
                        }}
                        component="ul">
                            {
                                getValues('tags').map((tag) => {

                                return (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={ () => onDeleteTag(tag)}
                                        color="primary"
                                        size='small'
                                        sx={{ ml: 1, mt: 1}}
                                    />
                                );
                            })}
                        </Box>

                        <Divider sx={{ my: 2  }}/>
                        
                        <Box display='flex' flexDirection="column">
                            <FormLabel sx={{ mb:1}}>Imágenes</FormLabel>
                            <Button
                                color="secondary"
                                fullWidth
                                startIcon={ <UploadOutlined /> }
                                sx={{ mb: 3 }}
                                onClick={()=>fileInputRef.current?.click()}
                            >
                                Cargar imagen
                            </Button>

                            <input 
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept='image/png, image/gif, image/jpeg'
                                style={{display:'none'}}
                                onChange={onFilesSelected}
                            />

                            <Chip 
                                label="Es necesario al 2 imagenes"
                                color='error'
                                variant='outlined'
                                sx={{display: getValues('images').length < 2 ? 'flex' : 'none'}}
                            />

                            <Grid container spacing={2}>
                                {
                                    getValues('images').map( img => (
                                        <Grid item xs={4} sm={3} key={img}>
                                            <Card>
                                                <CardMedia 
                                                    component='img'
                                                    className='fadeIn'
                                                    image={ img }
                                                    alt={ img }
                                                />
                                                <CardActions>
                                                    <Button 
                                                        fullWidth 
                                                        color="error"
                                                        onClick={()=>onDeleteImg(img)}
                                                        >
                                                        Borrar
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                }
                            </Grid>

                        </Box>

                    </Grid>
                    
                </Grid>
            </form>
        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    
    const { slug = ''} = query;

    let product : IProduct | null;

    if(slug==='new'){
        const temProduct = JSON.parse(JSON.stringify(new Product));
        delete temProduct._id;
        temProduct.images=['img1.jpg', 'img2.jpg'];
        product = temProduct;
    }else{
        product = await dbProducts.getProductBySlug(slug.toString());
    }
    

    if ( !product ) {
        return {
            redirect: {
                destination: '/admin/products',
                permanent: false,
            }
        }
    }
    

    return {
        props: {
            product
        }
    }
}


export default ProductAdminPage