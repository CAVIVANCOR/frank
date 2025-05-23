/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import './Accesos.css';
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
import { InputSwitch } from 'primereact/inputswitch';
export default function Accesos() {
    const urlBackEndData = import.meta.env.VITE_API_BASE_URL;
    let emptyRegistro = {
        id: null, // Identificador temporal único
        lectura: false,
        escritura: false,
        creacion: false,
        eliminacion: false,
        reportes: false,
        UsuarioId: null
    };
    const [dataRegistroState, setDataRegistroState] = useState(emptyRegistro);
    const [dataListRegistroState, setDataListRegistroState] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [fichaRegistroDialog, setFichaRegistroDialog] = useState(false);
    const [deleteRegistroDialog, setDeleteRegistroDialog] = useState(false);
    const [deleteRegistrosDialog, setDeleteRegistrosDialog] = useState(false);
    const [selectedRegistros, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const cargarAccesos = async () => {
        try {
            let response = await ( await axios.get(`${urlBackEndData}/accesos/?isAdministrator=true`)).data;
            let responseUsuarios = await (await axios.get(`${urlBackEndData}/usuarios/?isAdministrator=true`)).data;
            if (response.data.length > 0) {
                console.log('response.data', response.data, responseUsuarios.data);
                setDataListRegistroState(response.data);
                setUsuarios(responseUsuarios.data);
            }
        } catch (error) {
            console.log('error cargar Accesos', error);
        }
    };
    useEffect(() => {
        cargarAccesos();
    }, []);
    const openNew = () => {
        setDataRegistroState(emptyRegistro);
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
        console.log('saveRegistro', dataRegistroState);
        if (dataRegistroState.UsuarioId>0) {
            let _dataListRegistros = [...dataListRegistroState];
            let _dataRegistro = { ...dataRegistroState };
            if (dataRegistroState.id) {
                try {
                    const response = await axios.put(`${urlBackEndData}/accesos/${dataRegistroState.id}`, _dataRegistro);
                    if (response.data) {
                        const index = findIndexById(dataRegistroState.id);
                        _dataListRegistros[index] = _dataRegistro;
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Access Updated', life: 3000 });
                    }
                } catch (error) {
                    console.log('error saveRegistro Update', error);
                }
            } else {
                try {
                    const response = await axios.post(`${urlBackEndData}/accesos/`, _dataRegistro);
                    if (response.data) {
                        _dataListRegistros.push(_dataRegistro);
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Access Created', life: 3000 });
                    }
                } catch (error) {
                    console.log('error saveRegistro Create Accesos', error);
                }
            }
            setDataListRegistroState(_dataListRegistros);
            setFichaRegistroDialog(false);
            setDataRegistroState(emptyRegistro);
            cargarAccesos();
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
            const responseDeleted = await axios.delete(`${urlBackEndData}/accesos/${_dataRegistro.id}`);
            if (responseDeleted.data) {
                let _dataListRegistros = [...dataListRegistroState];
                const index = findIndexById(_dataRegistro.id);
                _dataListRegistros[index] = _dataRegistro;
                setDataListRegistroState(_dataListRegistros);
                setDeleteRegistroDialog(false);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Access Deleted', life: 3000 });
            }else{
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo borrar el Acceso', life: 3000 });
                throw new Error('No se pudo borrar el Acceso');
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
                    await axios.put(`${urlBackEndData}/accesos/${itemEncontrado.id}`, updatedUsuario);
                    return updatedUsuario;  
                } catch (error) {
                    console.error('Error updating Access', itemEncontrado.id, error);
                    return null;  
                }
            }
            return null; 
        });
        // Ejecuta todas las promesas y espera a que todas se completen
        const updatedUsuarios = (await Promise.all(updatePromises)).filter(p => p);
        setDeleteRegistrosDialog(false);
        setSelectedUsuarios(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Accesos Borrados OK', life: 3000 });
    };
    const onInputChange = (e, name) => {
        console.log("onInputChange", e, name);
        const val = e;
        let _dataRegistro = { ...dataRegistroState };
        _dataRegistro[`${name}`] = val;
        setDataRegistroState(_dataRegistro);
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
        if (!rowData.Usuario) return null; // Manejo de error si Usuario es null o indefinido
        const imageUrl = `${urlBackEndData}/media/usuarios/${rowData.Usuario.urlFoto}`;
        console.log('imageUrl', imageUrl,rowData.Usuario);
        return <img key={rowData.id} src={imageUrl} alt={rowData.Usuario.urlFoto} className="shadow-2 border-round" style={{ width: '64px' }} />;
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button size="small" icon="pi pi-pencil" rounded  className="mr-2 mb-2" onClick={() => editRegistro(rowData)} />
                <Button size="small" icon="pi pi-trash" rounded  className="mr-2 mb-2" severity="danger" onClick={() => confirmDeleteRegistro(rowData)} />
            </React.Fragment>
        );
    };
    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">CRUD Accesos</h4>
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
    const customBase64Uploader = async (event, productId) => {
        const file = event.files[0];
        let newFileName = '';
        if (!productId) {
            try {
                const responseMaxId = await axios.get(`${urlBackEndData}/usuarios/maxId`);
                if (responseMaxId){
                    newFileName = `${responseMaxId.data.data + 1}.jpg`;
                    onInputChange(+(responseMaxId.data.data + 1), 'id')
                }else{
                    throw new Error('No se pudo obtener el maxId');
                }
            } catch (error) {
                console.log('error customBase64Uploader', error);
            }
        }else {
            newFileName = `${productId}.jpg`; // o puedes usar file.name si quieres mantener el nombre original
        }
        const formData = new FormData();
        formData.append('file', file, newFileName);
        try {
            const response = await axios.post(`${urlBackEndData}/media/usuarios/`, formData);
            onInputChange(newFileName, 'urlFoto')
            console.log('Image uploaded successfully:', newFileName);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
        return newFileName;
    };
    const verifiedBodyTemplate = (rowData) => {
        return <i key={Math.random()} className={classNames('pi', { 'text-green-500 pi-check-circle': !rowData.borradoLogico, 'text-red-500 pi-times-circle': rowData.borradoLogico })}></i>;
    };
    
    return (
        <div className="cuerpoAccesos">
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
                    <Column field="borradoLogico" header="Estado" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '4rem' }} body={verifiedBodyTemplate} sortable />
                    <Column field="UsuarioId" header="Usuario" body={imageBodyTemplate} sortable></Column>
                    <Column field="lectura" header="Lectura" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '4rem' }} body={verifiedBodyTemplate} sortable />
                    <Column field="escritura" header="Escritura" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '4rem' }} body={verifiedBodyTemplate} sortable />
                    <Column field="creacion" header="Creación" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '4rem' }} body={verifiedBodyTemplate} sortable />
                    <Column field="eliminacion" header="Eliminación" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '4rem' }} body={verifiedBodyTemplate} sortable />
                    <Column field="reportes" header="Reportes" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '4rem' }} body={verifiedBodyTemplate} sortable />
                </DataTable>
            </div>
            <Dialog visible={fichaRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Ficha Acceso" modal className="p-fluid" footer={fichaDialogFooter} onHide={hideDialog}>
                {dataRegistroState.UsuarioId && 
                    (<img src={`${urlBackEndData}/media/usuarios/${dataRegistroState.UsuarioId}.jpg?${new Date().getTime()}`} 
                        alt={dataRegistroState.UsuarioId} 
                        style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', maxWidth: '150px', maxHeight: '150px', objectFit: 'contain', marginBottom: '2em' }}
                    />)
                }
                <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="lectura" className="font-bold" style={{ width: '100px', marginRight: '1.5em' }}>Lectura</label>
                    <InputSwitch inputId='lectura' checked={dataRegistroState.lectura} onChange={(e) => setDataRegistroState({ ...dataRegistroState, lectura: e.value })} />
                </div>
                <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="escritura" className="font-bold" style={{ width: '100px', marginRight: '1.5em' }}>Escritura</label>
                    <InputSwitch checked={dataRegistroState.escritura} onChange={(e) => setDataRegistroState({ ...dataRegistroState, escritura: e.value })} />
                </div>
                <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="creacion" className="font-bold" style={{ width: '100px', marginRight: '1.5em' }}>Creación</label>
                    <InputSwitch checked={dataRegistroState.creacion} onChange={(e) => setDataRegistroState({ ...dataRegistroState, creacion: e.value })} />
                </div>
                <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="eliminacion" className="font-bold" style={{ width: '100px', marginRight: '1.5em' }}>Eliminación</label>
                    <InputSwitch checked={dataRegistroState.eliminacion} onChange={(e) => setDataRegistroState({ ...dataRegistroState, eliminacion: e.value })} />
                </div>
                <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="reportes" className="font-bold" style={{ width: '100px', marginRight: '1.5em' }}>Reportes</label>
                    <InputSwitch checked={dataRegistroState.reportes} onChange={(e) => setDataRegistroState({ ...dataRegistroState, reportes: e.value })} />
                </div>
                <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="UsuarioId" className="font-bold" style={{ width: '100px', marginRight: '1.5em' }}>Usuario</label>
                    <ListBox 
                        value={dataRegistroState.UsuarioId} 
                        options={usuarios} 
                        onChange={(e) => onInputChange(e.value.id, 'UsuarioId')} 
                        className="w-full md:w-14rem" 
                        optionLabel="nombres"
                        itemTemplate={(option) => (
                        <div className="user-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                            <div style={{ marginRight: '0.5em' }}>
                                <img src={`${urlBackEndData}/media/usuarios/${option.id}.jpg`} 
                                    alt={option.nombres} 
                                    style={{ width: '32px', height: '32px' }} 
                                />
                            </div>
                            <div style={{ flex: '1', minWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {option.nombres}
                            </div>
                        </div>
                        )}
                    />               
                </div>
            </Dialog>
            <Dialog visible={deleteRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteFichaDialogFooter} onHide={hideDeleteRegistroDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && (
                        <span>
                            Esta seguro de Borrar el Acceso <b>{dataRegistroState.nombres}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={deleteRegistrosDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteListaDialogFooter} onHide={hideDeleteRegistrosDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && <span>Esta Seguro de Eliminar los Accesos Seleccionados?</span>}
                </div>
            </Dialog>
        </div>
    );
}
        