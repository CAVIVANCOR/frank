/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import './Medias.css';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import axios from 'axios';
import { ListBox } from 'primereact/listbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { SelectButton } from 'primereact/selectbutton';
import { BsNutFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';
export default function Medias() {
    const urlBackEndData = import.meta.env.VITE_API_BASE_URL;
    const userLogueado= useSelector((state) => state.login.user);
    // console.log('userLogueado', userLogueado,userLogueado.id);
    let emptyRegistro = {
        id: null, // Identificador temporal único
        fecha: new Date().toISOString().split('T')[0], // Formato 'YYYY-MM-DD' para PostgreSQL
        title: '',
        url: '',
        mediaType: 'VIDEO',
        CategoryId: 1,
        UsuarioId: null
    };
    const [dataRegistroState, setDataRegistroState] = useState(emptyRegistro);
    const [dataListRegistroState, setDataListRegistroState] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const mediaTypes = ['VIDEO', 'FOTO'];
    const [fichaRegistroDialog, setFichaRegistroDialog] = useState(false);
    const [deleteRegistroDialog, setDeleteRegistroDialog] = useState(false);
    const [deleteRegistrosDialog, setDeleteRegistrosDialog] = useState(false);
    const [selectedRegistros, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const cargarMedias = async () => {
        try {
            let response = await ( await axios.get(`${urlBackEndData}/medias/?isAdministrator=true`)).data;
            let responseUsuarios = await (await axios.get(`${urlBackEndData}/usuarios/`)).data;
            let responseCategorias = await (await axios.get(`${urlBackEndData}/categories/`)).data;
            setUsuarios(responseUsuarios.data);
            setCategorias(responseCategorias.data);
            console.log('cargarMedias: OK response.data', responseUsuarios.data, responseCategorias.data, response.data);
            if (response.data.length > 0) {
                setDataListRegistroState(response.data);
            }
        } catch (error) {
            console.log('cargarMedias: Error', responseUsuarios.data, responseCategorias.data, response.data);
            console.log('error cargarUsuarios', error);
        }
    };
    useEffect(() => {
        cargarMedias();
    }, []);
    const openNew = () => {
        emptyRegistro.UsuarioId = userLogueado.id;
        setDataRegistroState(emptyRegistro);
        console.log('openNew', userLogueado.id, dataRegistroState);
        setSubmitted(false);
        setFichaRegistroDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setFichaRegistroDialog(false);
    };

    const hideDeleteRegistroDialog = () => {
        setDeleteRegistroDialog(false);
    };

    const hideDeleteRegistrosDialog = () => {
        setDeleteRegistrosDialog(false);
    };

    const saveRegistro = async () => {
        setSubmitted(true);
        let _dataListRegistros = [];
        if (dataRegistroState.url!=='') {
            if (dataListRegistroState){
                _dataListRegistros = [...dataListRegistroState];
            }
            let _dataRegistro = { ...dataRegistroState };
            if (dataRegistroState.id) {
                try {
                    const response = await axios.put(`${urlBackEndData}/medias/${dataRegistroState.id}`, _dataRegistro);
                    if (response.data) {
                        const index = findIndexById(dataRegistroState.id);
                        _dataListRegistros[index] = _dataRegistro;
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Media Updated', life: 3000 });
                    }
                } catch (error) {
                    console.log('error saveRegistro Update Media', error);
                }
            } else {
                try {
                    delete _dataRegistro.id;
                    setDataRegistroState(_dataRegistro);
                    const response = await axios.post(`${urlBackEndData}/medias/`, _dataRegistro);
                    if (response.data) {
                        _dataListRegistros.push(response.data);
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Media Created', life: 3000 });
                    }
                } catch (error) {
                    console.log('error saveRegistro Create Media', error);
                }
            }
            setDataListRegistroState(_dataListRegistros);
            setFichaRegistroDialog(false);
            setDataRegistroState(emptyRegistro);
            cargarMedias();
        }
    };
    const editRegistro = (fichaData) => {
        setDataRegistroState({ ...fichaData });
        setFichaRegistroDialog(true);
    };
    const confirmDeleteRegistro = (RegistroData) => {
        setDataRegistroState(RegistroData);
        setDeleteRegistroDialog(true);
    };
    const deleteRegistro = async () => {
        let _dataRegistro = { ...dataRegistroState };
        _dataRegistro.borradoLogico = !_dataRegistro.borradoLogico;
        setDataRegistroState(_dataRegistro);
        try {
            const responseDeleted = await axios.delete(`${urlBackEndData}/medias/${_dataRegistro.id}`);
            if (responseDeleted.data) {
                let _dataListRegistros = [...dataListRegistroState];
                const index = findIndexById(_dataRegistro.id);
                _dataListRegistros[index] = _dataRegistro;
                setDataListRegistroState(_dataListRegistros);
                setDeleteRegistroDialog(false);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Media Deleted', life: 3000 });
            }else{
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo borrar la Media', life: 3000 });
                throw new Error('No se pudo borrar la Media');
            }
        } catch (error) {
            console.log('error deleteRegistro', error);
        }
    };
    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < dataListRegistroState.length; i++) {
            if (dataListRegistroState[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };
    const confirmDeleteSelected = () => {
        setDeleteRegistrosDialog(true);
    };
    const deleteSelectedRegistros = async () => {
        let _dataListRegistros = dataListRegistroState.map((item) => {
            if (selectedRegistros.includes(item)) {
                return { ...item, borradoLogico: !item.borradoLogico };
            }
            return item;
        });
        setDataListRegistroState(_dataListRegistros);
        const updatePromises = selectedRegistros.map(async (selectedItem) => {
            const itemEncontrado = dataListRegistroState.find(p => p.id === selectedItem.id);
            if (itemEncontrado) {
                const updatedUsuario = { ...itemEncontrado, borradoLogico: !itemEncontrado.borradoLogico };
                try {
                    await axios.put(`${urlBackEndData}/medias/${itemEncontrado.id}`, updatedUsuario);
                    return updatedUsuario;  
                } catch (error) {
                    console.error('Error updating Media', itemEncontrado.id, error);
                    return null;  
                }
            }
            return null; 
        });
        // Ejecuta todas las promesas y espera a que todas se completen
        const updatedUsuarios = (await Promise.all(updatePromises)).filter(p => p);
        setDeleteRegistrosDialog(false);
        setSelectedUsuarios(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Medias Borrados OK', life: 3000 });
    };
    const onInputChange = (e, name) => {
        // Asumiendo que `e.target.value` es lo que quieres asignar.
        const val = e;
        // Utiliza la versión funcional de setState para asegurarte de tener el estado más reciente.
        setDataRegistroState(prevDataRegistro => {
            // Crea una nueva copia del estado previo para actualizar.
            const updatedRegistro = {
                ...prevDataRegistro,
                [name]: val
            };
            // Registra el valor para depuración.
            console.log('onInputChange', name, val, 'updatedRegistro:', updatedRegistro);
            // Retorna el estado actualizado.
            return updatedRegistro;
        });
    };
    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedRegistros || !selectedRegistros.length} />
            </div>
        );
    };
    const imageBodyTemplate = (rowData) => {
        if (!rowData.url) return null; // Si no hay URL, no mostrar nada
        if (rowData.mediaType === 'VIDEO') {
            const videoId = rowData.url.split('be/')[1];
            const videoUrl = `https://www.youtube.com/embed/${videoId}`;
            return <iframe src={videoUrl} title={rowData.url} width="160" height="120" frameBorder="0" allowFullScreen 
            style={{
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '10px',
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
            }} />;
         }else {
            const imageUrl = `${urlBackEndData}/media/fotos/${rowData.url}`;
            return <img src={imageUrl} alt={rowData.url} className="shadow-2 border-round" style={{ width: '128px' }} />;
        }
    };
    const creadorBodyTemplate = (rowData) => {
        console.log('creadorBodyTemplate rowData', rowData,"usuarios",usuarios,"usuario",usuarios[rowData.UsuarioId].usuario);
        if (!rowData.UsuarioId) return null; // Si no hay URL, no mostrar nada
        return usuarios[rowData.UsuarioId].usuario;
    };
    const idBodyTemplate = (rowData) => {
        if (!rowData) return null; // Si no hay URL, no mostrar nada
        return rowData.id;
    };
    const categoriaBodyTemplate = (rowData) => {
        if (!rowData.CategoryId) return null; // Si no hay URL, no mostrar nada
        return <Tag value={categorias.find(cat => parseInt(cat.id) === parseInt(rowData.CategoryId)).descripcion} severity={getSeverity(parseInt(rowData.CategoryId))}></Tag>;
    };
    const mediaTypeBodyTemplate = (rowData) => {
        if (!rowData.mediaType) return null; // Si no hay URL, no mostrar nada
        let style;
        if (rowData.mediaType === 'FOTO') {
            style = { backgroundColor: '#f5c9c9', color : '#373733' }; // Estilo rosado claro
        } else if (rowData.mediaType === 'VIDEO') {
            style = { backgroundColor: '#f7f335', color: '#373733' }; // Estilo amarillo claro más oscuro
        } else {
            style = { backgroundColor: 'defaultColor' }; // Estilo por defecto para otros casos
        }
        return <Tag value={rowData.mediaType} style={style} ></Tag>;
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button size="small" icon="pi pi-pencil" rounded  className="mr-2 mb-2" onClick={() => editRegistro(rowData)} />
                <Button size="small" icon="pi pi-trash" rounded  className="mr-2 mb-2" severity="danger" onClick={() => confirmDeleteRegistro(rowData)} />
            </React.Fragment>
        );
    };
    const getSeverity = (id) => {
        switch (id) {
            case 1:
                return 'primary';
            case 2:
                return 'success';
            case 3:
                return 'info';
            case 4:
                return 'warning';
            default:
                return 'danger';
        }
    };
    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">CRUD Media</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </IconField>
        </div>
    );
    const fichaDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveRegistro} />
        </React.Fragment>
    );
    const deleteFichaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteRegistroDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteRegistro} />
        </React.Fragment>
    );
    const deleteListaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteRegistrosDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedRegistros} />
        </React.Fragment>
    );
    const customBase64Uploader = async (event, dataId) => {
        const file = event.files[0];
        let newFileName = '';
        let uploadPath = '';
        const fileExtension = file.type.split('/')[1];
        const fileType = file.type.split('/')[0]; // 'image' o 'video'
        if (fileType === 'image' && ['jpg', 'jpeg', 'png'].includes(fileExtension)) {
            uploadPath = '/media/fotos/';
        } else if (fileType === 'video' && fileExtension === 'mp4') {
            uploadPath = '/media/videos/';
        } else {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Tipo de archivo no soportado', life: 3000 });
            return;
        }
        if (!dataId) {
            try {
                const responseMaxId = await axios.get(`${urlBackEndData}/medias/maxId`);
                if (responseMaxId) {
                    const newId = responseMaxId.data.data + 1;
                    newFileName = `${newId}.${fileExtension}`;
                    console.log('customBase64Uploader newID:',newId," newFileName:", newFileName);
                    // onInputChange(newId, 'id');
                } else {
                    throw new Error('No se pudo obtener el maxId');
                }
            } catch (error) {
                console.log('error en customBase64Uploader', error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el maxId', life: 3000 });
            }
        } else {
            newFileName = `${dataId}.${fileExtension}`;
        }
        onInputChange(newFileName, 'url');
        const formData = new FormData();
        formData.append('file', file, newFileName);
        try {
            const response = await axios.post(`${urlBackEndData}${uploadPath}`, formData);
            console.log('Archivo subido con éxito:', newFileName);
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo subir el archivo', life: 3000 });
        }
        return newFileName;
    };
    const verifiedBodyTemplate = (rowData) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': !rowData.borradoLogico, 'text-red-500 pi-times-circle': rowData.borradoLogico })}></i>;
    };
    return (
        <div className="cuerpoMedias">
            <Toast ref={toast} position='center' />
            <div className="container mx-auto ">
                <Toolbar className="mb-2" left={leftToolbarTemplate} ></Toolbar>
                <DataTable 
                    ref={dt} 
                    value={dataListRegistroState} 
                    selection={selectedRegistros} 
                    onSelectionChange={(e) => setSelectedUsuarios(e.value)}
                    dataKey="id"  
                    paginator 
                    rows={10} 
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} a {last} Total {totalRecords}" 
                    globalFilter={globalFilter} 
                    header={header}>
                    <Column selectionMode="multiple" exportable={false}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '4rem'}}></Column>
                    <Column field="id" header="ID" body={idBodyTemplate} sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="borradoLogico" header="State" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '1rem' }} body={verifiedBodyTemplate} sortable />
                    <Column field="CategoryId" header="Category" body={categoriaBodyTemplate} sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="title" header="Title" sortable style={{ minWidth: '4rem' }}></Column>
                    <Column field="mediaType" header="Tipo" body={mediaTypeBodyTemplate} sortable style={{ minWidth: '1rem' }}></Column>
                    <Column field="url" header="Foto/Video" body={imageBodyTemplate}></Column>
                    <Column field="UsuarioId" header="Creador" body={creadorBodyTemplate} sortable style={{ minWidth: '2rem' }}></Column>
                </DataTable>
            </div>
            <Dialog visible={fichaRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Ficha Media" modal className="p-fluid" footer={fichaDialogFooter} onHide={hideDialog}>
                {dataRegistroState.url !== '' && 
                    (dataRegistroState.mediaType === 'VIDEO' 
                        ? <iframe
                        src={`https://www.youtube.com/embed/${dataRegistroState.url.split('be/')[1]}`}
                        title={dataRegistroState.url}
                        width="300"
                        height="169"
                        frameBorder="0"
                        allowFullScreen
                        style={{
                          display: 'block',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          borderRadius: '10px',
                          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
                        }}
                      />
                        : <img 
                            src={`${urlBackEndData}/media/fotos/${dataRegistroState.url}`} 
                            alt={dataRegistroState.url} 
                            style={{ 
                                display: 'block', 
                                marginLeft: 'auto', 
                                marginRight: 'auto', 
                                maxWidth: '300px', 
                                maxHeight: '300px', 
                                objectFit: 'contain' 
                            }}
                        />
                    )
                }
                <div className="field">
                    <label htmlFor="title" className="font-bold">Title</label>
                    <InputText id="title" value={dataRegistroState.title} onChange={(e) => onInputChange(e.target.value, 'title')} required autoFocus className={classNames({ 'p-invalid': submitted && !dataRegistroState.title })} />
                    {submitted && !dataRegistroState.title && <small className="p-error">Title es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="description" className="font-bold">Description</label>
                    <InputTextarea id="description" value={dataRegistroState.description} onChange={(e) => onInputChange(e.target.value, 'description')} required rows={5} cols={20} />
                </div>
                <div className="field">
                    <label htmlFor="mediaType" className="font-bold">Type</label>
                    <SelectButton value={dataRegistroState.mediaType} onChange={(e) => onInputChange(e.target.value, 'mediaType')} options={mediaTypes} />
                </div>
                <div className="field">
                    <label htmlFor="CategoryId" className="font-bold">Category</label>
                    <ListBox value={categorias.find(cat => parseInt(cat.id) === parseInt(dataRegistroState.CategoryId))} onChange={(e) => onInputChange(e.value.id, 'CategoryId')} options={categorias} optionLabel="descripcion" className="w-full md:w-14rem"/>
                </div>
                <div className="field">
                    <label htmlFor="url" className="font-bold">Url</label>
                    <InputText id="url" value={dataRegistroState.url} onChange={(e) => onInputChange(e.target.value, 'url')} required autoFocus className={classNames({ 'p-invalid': submitted && !dataRegistroState.url })} />
                    {submitted && !dataRegistroState.url && <small className="p-error">Url es requerido.</small>}
                    {/* <FileUpload mode="basic" name="demo[]"  accept="image/*,video/mp4" customUpload={true} onSelect={(e) => customBase64Uploader(e, dataRegistroState.id)} uploadHandler={(e) => customBase64Uploader(e,dataRegistroState.id)} /> */}
                </div>
            </Dialog>
            <Dialog visible={deleteRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteFichaDialogFooter} onHide={hideDeleteRegistroDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && (
                        <span>
                            Esta seguro de Borrar La Media <b>{dataRegistroState.nombres}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={deleteRegistrosDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteListaDialogFooter} onHide={hideDeleteRegistrosDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && <span>Esta Seguro de Eliminar las medias Seleccionadas?</span>}
                </div>
            </Dialog>
        </div>
    );
}
        