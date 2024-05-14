/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import "./Media.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setResults } from "../redux/features/task/inicio";
import { DataView } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ListBox } from 'primereact/listbox';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { SelectButton } from 'primereact/selectbutton';

export default function Media() {
    const [mediaSelection, setMediaSelection] = useState(['FOTO', 'VIDEO']);
    const mediaSelectionOptions = [
        { name: 'Fotos', value: 'FOTO' },
        { name: 'Videos', value: 'VIDEO' }
    ];
    const [rows, setRows] = useState(8);
    const [columnWidth, setColumnWidth] = useState('col-12 sm:col-4 lg:col-3 xl:col-2');
    const [categoryKey, setCategoryKey] = useState({});
    const [creadoresKey, setCreadoresKey] = useState({});
    const [sortKey, setSortKey] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [sortField, setSortField] = useState('');
    const sortOptions = [
        { label: 'Creador ascendente', value: 'Usuario.usuario' },
        { label: 'Creador descendente', value: '!Usuario.usuario' },
        { label: 'Categoria ascendente', value: 'Category.descripcion' },
        { label: 'Categoria descendente', value: '!Category.descripcion' },
        { label: 'Titulo ascendente', value: 'title' },
        { label: 'Titulo descendente', value: '!title' }
    ];
    const urlBackEndData = import.meta.env.VITE_API_BASE_URL;
    const results = useSelector((state) => state.inicio.results);
    const [mediaResults, setMediaResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [creadores, setCreadores] = useState([]);
    const [visibleCategories, setVisibleCategories] = useState(false);
    const [visibleCreadores, setVisibleCreadores] = useState(false);
    const [visibleSort, setVisibleSort] = useState(false);
    const [searchMedia, setSearchMedia] = useState('');
    const dispatch = useDispatch();
    
    const cargarCategorias = (dataArray) => {
        let categoriesArray = dataArray.map(media => ({
            label: media.Category.descripcion,
            value: parseInt(media.Category.id)
        }));
        const uniqueCategories = [...new Set(categoriesArray.map(category => JSON.stringify(category)))].map(category => JSON.parse(category));
        return uniqueCategories;
    }
    const cargarCreadores = (dataArray) => {
        let creadoresArray = dataArray.map(media => ({
            label: media.Usuario.usuario,
            value: media.UsuarioId
        }));
        const uniqueCreadores = [...new Set(creadoresArray.map(creador => JSON.stringify(creador)))].map(creador => JSON.parse(creador));
        return uniqueCreadores;
    }
    const cargarFotos = async () => {
        try {
        let response = await ( await axios.post(`${urlBackEndData}/medias/search/`,{mediaType:mediaSelection})).data;
        if (response.data.length > 0) {
            const uniqueCategories= cargarCategorias(response.data);
            setCategories(uniqueCategories);
            const uniqueCreadores= cargarCreadores(response.data);
            setCreadores(uniqueCreadores);
            dispatch(setResults(response.data));
            setMediaResults(response.data);
        }
        } catch (error) {
        console.log('error cargarFotos', error);
        }
    }
    useEffect(() => {
        console.log("Entro a useEffect de Photos");
        cargarFotos();
    },[]);
    useEffect(() => {
        const updateColumnWidth = () => {
            const screenWidth = window.innerWidth;
            console.log('screenWidth', screenWidth);
            if (screenWidth >= 2048) {
                setColumnWidth('col-12 sm:col-6 lg:col-3 xl:col-2');
                setRows(12);
            }else if (screenWidth >= 1024) {
                setColumnWidth('col-12 sm:col-6 lg:col-5 xl:col-3');
                setRows(8);
            } else if (screenWidth >= 600) {
                setColumnWidth('col-12 sm:col-6 lg:col-5 xl:col-4');
                setRows(8);
            } else {
                setColumnWidth('col-12 sm:col-12 lg:col-12 xl:col-6');
                setRows(8);
            }
        };
        updateColumnWidth();
        window.addEventListener('resize', updateColumnWidth);
        return () => {
            window.removeEventListener('resize', updateColumnWidth);
        };
    }, []);
    const gridItem = (product) => {
        return (
          <div className={`${columnWidth} p-1`} key={product.id} style={{ display: 'flex', marginBottom: '1rem' }}>
            <div className="p-4 border-1 surface-border surface-card border-round" style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
              <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-tag"></i>
                  <span className="font-semibold">{product.Usuario.usuario}</span>
                </div>
                <Tag value={product.Category.descripcion} severity='success'></Tag>
              </div>
              <div className="flex flex-column align-items-center gap-3 py-5">
                {product.mediaType === 'FOTO' 
                  ? (<Image src={`${urlBackEndData}/media/fotos/${product.url}`} alt={product.title} width='250' preview imageStyle={{borderRadius: '10px', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'}} />) 
                  : (<video src={`${urlBackEndData}/media/videos/${product.url}`} alt={product.title} width='220' controls style={{borderRadius: '10px', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'}}></video>)}
              </div>
              <div style={{ flexGrow: 0, flexShrink: 0, alignSelf: 'center' }}>
                <div className="text-2xl font-bold">{product.title}</div>
                <div className="text-1xl font-cursive" style={{ fontSize: 'small', fontStyle: 'italic' }}>{product.description}</div>
              </div>
            </div>
          </div>
        );
      };

    const itemTemplate = (product) => {
        if (!product) {
            return;
        }
        return gridItem(product);
    };

    const listTemplate = (media) => {
        return <div className="grid grid-nogutter">{media.map((product) => itemTemplate(product))}</div>;
    };
    const onSortChange = (event) => {
        const value = event.value;
        if (value.indexOf('!') === 0) {
            setSortOrder(-1);
            setSortField(value.substring(1, value.length));
        } else {
            setSortOrder(1);
            setSortField(value);
        }
        const selectedOption = sortOptions.find(option => option.value === value);
        setSortKey(selectedOption.label);
        setVisibleSort(false);
    };
    const OnSelectCategories =  (event) => {
        setCategoryKey(categories.find(category => category.value === event.value));
        const mediaFiltrada = mediaResults.filter(media => parseInt(media.Category.id) === parseInt(event.value));
        setMediaResults(mediaFiltrada);
        setVisibleCategories(false);
    };
    const OnSelectCreadores =  (event) => {
        setCreadoresKey(creadores.find(creador => creador.value === event.value));
        const mediaFiltrada = mediaResults.filter(media => media.UsuarioId === event.value);
        setMediaResults(mediaFiltrada);
        setVisibleCreadores(false);
    }
    const onSearchMedia = (value) => {
        console.log('onSearchMedia', value);
        const mediaFiltrada = mediaResults.filter(media => 
            media.title.toLowerCase().includes(value.toLowerCase()) || 
            media.description.toLowerCase().includes(value.toLowerCase())
        );
        setMediaResults(mediaFiltrada);
    }
    const onSelectMedia = (value) => {
        setMediaSelection(value)
        if (value.length === 0){
            setMediaResults([]);
        } else if (value.length === 1){
            if (value[0] === 'FOTO') {
                const mediaFiltrada = results.filter(media => media.mediaType === 'FOTO');
                setMediaResults(mediaFiltrada);
            }
            if (value[0] === 'VIDEO') {
                const mediaFiltrada = results.filter(media => media.mediaType === 'VIDEO');
                setMediaResults(mediaFiltrada);
            }
        } else if (value.length === 2){
            const mediaFiltrada = results.filter(media => media.mediaType === 'FOTO' || media.mediaType === 'VIDEO');
            setMediaResults(mediaFiltrada);
        }
    }
    const actualizaCategorias = () => {
        const uniqueCategories = cargarCategorias(mediaResults);
        setCategories(uniqueCategories);
        setVisibleCategories(true)
    };
    const actualizaCreadores = () => {
        const uniqueCreadores = cargarCreadores(mediaResults);
        setCreadores(uniqueCreadores);
        setVisibleCreadores(true)
    }
    const resetCategories = () => {
        setMediaResults(results);
        setCategoryKey({});
        setCreadoresKey({});
        const uniqueCategories = cargarCategorias(mediaResults);
        setCategories(uniqueCategories);
        setVisibleCategories(false);
        const uniqueCreadores = cargarCreadores(mediaResults);
        setCreadores(uniqueCreadores);
        setVisibleCreadores(false);
        setSearchMedia('');
        setMediaSelection(['FOTO', 'VIDEO']);
    }
    const headerCategories = (
        <div className="inline-flex align-items-center justify-content-center gap-2">
            <span className="font-bold white-space-nowrap">Categorias</span>
        </div>
    );
    const headerCreadores = (
        <div className="inline-flex align-items-center justify-content-center gap-2">
            <span className="font-bold white-space-nowrap">Creadores</span>
        </div>
    );
    const headerOrdenarPor = (
        <div className="inline-flex align-items-center justify-content-center gap-2">
            <span className="font-bold white-space-nowrap">Ordenar Por</span>
        </div>
    );
    const header = () => {
        return (
            <div className="container mx-auto flex flex-wrap justify-content-center gap-3">
                <div className="flex flex-column">
                    <SelectButton value={mediaSelection} onChange={(e) => onSelectMedia(e.value)} optionLabel="name" options={mediaSelectionOptions} multiple />
                </div>
                <div className="flex flex-column">
                    <Button raised className='bg-red-300 text-gray-800 border-none' size="small" label="Reset" onClick={() => resetCategories()} />
                </div>
                <div className="flex flex-column">
                    <Button raised className='bg-yellow-300 text-gray-800 border-none' size="small" label={categoryKey?.label ? categoryKey.label.charAt(0).toUpperCase() + categoryKey.label.slice(1).toLowerCase() : 'Categorias'}  onClick={() => actualizaCategorias()} />
                    <Dialog visible={visibleCategories}  header={headerCategories}  style={{ width: 'auto', justifyContent: 'center'  }}  onHide={() => setVisibleCategories(false)}>
                        <div className="m-0">  
                            <ListBox value={categoryKey.value} onChange={(e) => OnSelectCategories(e)} options={categories} optionLabel="label" className="w-full md:w-14rem" />
                        </div>
                    </Dialog>
                </div>
                <div className="flex flex-column">
                    <Button raised className='bg-yellow-300 text-gray-800 border-none' size="small" label={creadoresKey?.label ? creadoresKey.label.charAt(0).toUpperCase() + creadoresKey.label.slice(1).toLowerCase() : 'Creadores'}  onClick={() => actualizaCreadores()} />
                    <Dialog visible={visibleCreadores}  header={headerCreadores}  style={{ width: 'auto', justifyContent: 'center'  }}  onHide={() => setVisibleCreadores(false)}>
                        <div className="m-0">  
                            <ListBox value={creadoresKey.value} onChange={(e) => OnSelectCreadores(e)} options={creadores} optionLabel="label" className="w-full md:w-14rem" />
                        </div>
                    </Dialog>
                </div>
                <div className="flex flex-column">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search"> </InputIcon>
                        <InputText placeholder="Titulo/Descripcion" id="searchMedia" value={searchMedia} onChange={(e) => setSearchMedia(e.target.value)} onBlur={(e) => onSearchMedia(e.target.value)}  />
                    </IconField>
                </div>
                <div className="flex flex-column">
                    <Button raised className='bg-blue-300 text-gray-800 border-none'size="small" label={sortKey!='' ? sortKey : 'Ordenar'}  onClick={() => setVisibleSort(true)} />
                    <Dialog visible={visibleSort}  header={headerOrdenarPor}  style={{ width: 'auto', justifyContent: 'center'  }}  onHide={() => setVisibleSort(false)}>
                        <div className="m-0">  
                            <ListBox value={sortKey} onChange={(e) => onSortChange(e)} options={sortOptions} optionLabel="label" className="w-full md:w-14rem" />
                        </div>
                    </Dialog>
                </div>
            </div>
        );
    };
    
    return (
        <div className="cuerpoFotos">
            <DataView value={mediaResults} listTemplate={listTemplate} layout='grid' header={header()} sortField={sortField} sortOrder={sortOrder} paginator rows={rows}/>
        </div>
    );
}

