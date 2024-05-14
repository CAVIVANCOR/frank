/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import './Usuarios.css';
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
export default function Usuarios() {
    const urlBackEndData = import.meta.env.VITE_API_BASE_URL;
    let emptyRegistro = {
        id: null, // Identificador temporal único
        usuario: '',
        password: '',
        nombres: '',
        email: '',
        urlFoto: '',
        RolId: 3
    };
    const [dataRegistroState, setDataRegistroState] = useState(emptyRegistro);
    const [dataListRegistroState, setDataListRegistroState] = useState(null);
    const [roles, setRoles] = useState([]);
    const [fichaRegistroDialog, setFichaRegistroDialog] = useState(false);
    const [deleteRegistroDialog, setDeleteRegistroDialog] = useState(false);
    const [deleteRegistrosDialog, setDeleteRegistrosDialog] = useState(false);
    const [selectedRegistros, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const cargarUsuarios = async () => {
        try {
            let response = await ( await axios.get(`${urlBackEndData}/usuarios/?isAdministrator=true`)).data;
            let responseRoles = await (await axios.get(`${urlBackEndData}/roles/`)).data;
            if (response.data.length > 0) {
                setDataListRegistroState(response.data);
                setRoles(responseRoles.data);
            }
        } catch (error) {
            console.log('error cargarUsuarios', error);
        }
    };
    useEffect(() => {
        cargarUsuarios();
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
        if (dataRegistroState.usuario.trim()) {
            let _dataListRegistros = [...dataListRegistroState];
            let _dataRegistro = { ...dataRegistroState };
            if (dataRegistroState.id) {
                try {
                    const response = await axios.put(`${urlBackEndData}/usuarios/${dataRegistroState.id}`, _dataRegistro);
                    if (response.data) {
                        const index = findIndexById(dataRegistroState.id);
                        _dataListRegistros[index] = _dataRegistro;
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
                    }
                } catch (error) {
                    console.log('error saveRegistro Update', error);
                }
            } else {
                try {
                    const response = await axios.post(`${urlBackEndData}/usuarios/`, _dataRegistro);
                    if (response.data) {
                        _dataListRegistros.push(_dataRegistro);
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
                    }
                } catch (error) {
                    console.log('error saveRegistro Create', error);
                }
            }
            setDataListRegistroState(_dataListRegistros);
            setFichaRegistroDialog(false);
            setDataRegistroState(emptyRegistro);
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
            const responseDeleted = await axios.delete(`${urlBackEndData}/usuarios/${_dataRegistro.id}`);
            if (responseDeleted.data) {
                let _dataListRegistros = [...dataListRegistroState];
                const index = findIndexById(_dataRegistro.id);
                _dataListRegistros[index] = _dataRegistro;
                setDataListRegistroState(_dataListRegistros);
                setDeleteRegistroDialog(false);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
            }else{
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo borrar el usuario', life: 3000 });
                throw new Error('No se pudo borrar el usuario');
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
                    await axios.put(`${urlBackEndData}/usuarios/${itemEncontrado.id}`, updatedUsuario);
                    return updatedUsuario;  
                } catch (error) {
                    console.error('Error updating Usuario', itemEncontrado.id, error);
                    return null;  
                }
            }
            return null; 
        });
        // Ejecuta todas las promesas y espera a que todas se completen
        const updatedUsuarios = (await Promise.all(updatePromises)).filter(p => p);
        setDeleteRegistrosDialog(false);
        setSelectedUsuarios(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Usuarios Borrados OK', life: 3000 });
    };
    const onInputChange = (e, name) => {
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
        const uniqueQuery = `?random=${Math.random()}`; // Generate a unique query parameter
        const imageUrl = `${urlBackEndData}/media/usuarios/${rowData.urlFoto}${uniqueQuery}`;
        return <img key={Math.random()} src={imageUrl} alt={rowData.urlFoto} className="shadow-2 border-round" style={{ width: '64px' }} />;
    };

    const rolBodyTemplate = (rowData) => {
        return <Tag key={Math.random()} value={roles[rowData.RolId-1].descripcion} severity={getSeverity(roles[rowData.RolId-1].descripcion)}></Tag>;
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button size="small" icon="pi pi-pencil" rounded  className="mr-2 mb-2" onClick={() => editRegistro(rowData)} />
                <Button size="small" icon="pi pi-trash" rounded  className="mr-2 mb-2" severity="danger" onClick={() => confirmDeleteRegistro(rowData)} />
            </React.Fragment>
        );
    };
    const getSeverity = (dataRol) => {
        switch (dataRol) {
            case 'SUPER':
                return 'success';
            case 'ADMIN':
                return 'warning';
            default:
                return 'danger';
        }
    };
    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">CRUD Usuarios</h4>
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
        <div className="cuerpoUsuarios">
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
                    <Column field="RolId" header="Rol" body={rolBodyTemplate} sortable style={{ minWidth: '4rem' }}></Column>
                    <Column field="borradoLogico" header="Estado" dataType="boolean" bodyClassName="text-center" style={{ minWidth: '4rem' }} body={verifiedBodyTemplate} sortable />
                    <Column field="url" header="Image" body={imageBodyTemplate}></Column>
                    <Column field="usuario" header="Usuario" sortable style={{ minWidth: '8rem' }}></Column>
                    <Column field="password" header="Password" sortable style={{ minWidth: '8rem' }}></Column>
                    <Column field="nombres" header="Nombres" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={fichaRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Ficha Usuario" modal className="p-fluid" footer={fichaDialogFooter} onHide={hideDialog}>
                {dataRegistroState.urlFoto && 
                    (<img src={`${urlBackEndData}/media/usuarios/${dataRegistroState.urlFoto}?${new Date().getTime()}`} 
                        alt={dataRegistroState.urlFoto} 
                        style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto', maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
                    />)
                }
                <div className="field">
                    <label htmlFor="usuario" className="font-bold">Usuario</label>
                    <InputText id="usuario" value={dataRegistroState.usuario} onChange={(e) => onInputChange(e.target.value, 'usuario')} required autoFocus className={classNames({ 'p-invalid': submitted && !dataRegistroState.usuario })} />
                    {submitted && !dataRegistroState.usuario && <small className="p-error">Usuario es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="password" className="font-bold">Password</label>
                    <InputText id="password" value={dataRegistroState.password} onChange={(e) => onInputChange(e.target.value, 'password')} required autoFocus className={classNames({ 'p-invalid': submitted && !dataRegistroState.password })} />
                    {submitted && !dataRegistroState.password && <small className="p-error">Password es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="nombres" className="font-bold">Nombres</label>
                    <InputText id="nombres" value={dataRegistroState.nombres} onChange={(e) => onInputChange(e.target.value, 'nombres')} required autoFocus className={classNames({ 'p-invalid': submitted && !dataRegistroState.nombres })} />
                    {submitted && !dataRegistroState.nombres && <small className="p-error">Nombres es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="email" className="font-bold">Email</label>
                    <InputText id="email" value={dataRegistroState.email} onChange={(e) => onInputChange(e.target.value, 'email')} required autoFocus className={classNames({ 'p-invalid': submitted && !dataRegistroState.email })} />
                    {submitted && !dataRegistroState.nombres && <small className="p-error">Nombres es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="urlFoto" className="font-bold">Url Foto</label>
                    <InputText id="urlFoto" value={dataRegistroState.urlFoto} onChange={(e) => onInputChange(e.target.value, 'urlFoto')} required disabled className={classNames({ 'p-invalid': submitted && !dataRegistroState.urlFoto })} />
                    {submitted && !dataRegistroState.urlFoto && <small className="p-error">Url Foto es requerido.</small>}
                    <FileUpload mode="basic" name="demo[]"  accept="image/*" customUpload={true} onSelect={(e) => customBase64Uploader(e, dataRegistroState.id)} uploadHandler={(e) => customBase64Uploader(e,dataRegistroState.id)} />
                </div>
                <div className="field">
                    <label htmlFor="RolId" className="font-bold">Rol</label>
                    <ListBox value={roles.find(rol => parseInt(rol.id) === parseInt(dataRegistroState.RolId))} onChange={(e) => onInputChange(e.value.id, 'RolId')} options={roles} optionLabel="descripcion" className="w-full md:w-14rem" />
                </div>
            </Dialog>
            <Dialog visible={deleteRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteFichaDialogFooter} onHide={hideDeleteRegistroDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && (
                        <span>
                            Esta seguro de Borrar el Usuario <b>{dataRegistroState.nombres}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={deleteRegistrosDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteListaDialogFooter} onHide={hideDeleteRegistrosDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && <span>Esta Seguro de Eliminar los usuarios Seleccionados?</span>}
                </div>
            </Dialog>
        </div>
    );
}
        