/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import './Categories.css';
import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';
export default function Categories() {
    const urlBackEndData = import.meta.env.VITE_API_BASE_URL;
    let emptyRegistro = {
        id: null, // Identificador temporal único
        descripcion: '',
    };
    const [dataRegistroState, setDataRegistroState] = useState(emptyRegistro);
    const [dataListRegistroState, setDataListRegistroState] = useState(null);
    const [fichaRegistroDialog, setFichaRegistroDialog] = useState(false);
    const [deleteRegistroDialog, setDeleteRegistroDialog] = useState(false);
    const [deleteRegistrosDialog, setDeleteRegistrosDialog] = useState(false);
    const [selectedRegistros, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const cargarCategorias = async () => {
        try {
            let response = await ( await axios.get(`${urlBackEndData}/categories/?isAdministrator=true`)).data;
            if (response.data.length > 0) {
                console.log('response.data', response.data);
                setDataListRegistroState(response.data);
            }
        } catch (error) {
            console.log('error cargar Accesos', error);
        }
    };
    useEffect(() => {
        cargarCategorias();
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
        if (dataRegistroState.descripcion !== '') {
            let _dataListRegistros = [...dataListRegistroState];
            let _dataRegistro = { ...dataRegistroState };
            if (dataRegistroState.id) {
                try {
                    const response = await axios.put(`${urlBackEndData}/categories/${dataRegistroState.id}`, _dataRegistro);
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
                    const response = await axios.post(`${urlBackEndData}/categories/`, _dataRegistro);
                    if (response.data) {
                        _dataListRegistros.push(_dataRegistro);
                        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Access Created', life: 3000 });
                    }
                } catch (error) {
                    console.log('error saveRegistro Create Categories', error);
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
            const responseDeleted = await axios.delete(`${urlBackEndData}/categories/${_dataRegistro.id}`);
            if (responseDeleted.data) {
                let _dataListRegistros = [...dataListRegistroState];
                const index = findIndexById(_dataRegistro.id);
                _dataListRegistros[index] = _dataRegistro;
                setDataListRegistroState(_dataListRegistros);
                setDeleteRegistroDialog(false);
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Categorie Deleted', life: 3000 });
            }
        } catch (error) {
            setDeleteRegistroDialog(false);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response.data.message, life: 3000 });
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
                    await axios.put(`${urlBackEndData}/categories/${itemEncontrado.id}`, updatedUsuario);
                    return updatedUsuario;  
                } catch (error) {
                    console.error('Error updating categories', itemEncontrado.id, error);
                    return null;  
                }
            }
            return null; 
        });
        // Ejecuta todas las promesas y espera a que todas se completen
        const updatedUsuarios = (await Promise.all(updatePromises)).filter(p => p);
        setDeleteRegistrosDialog(false);
        setSelectedUsuarios(null);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'categories Borrados OK', life: 3000 });
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
            <h4 className="m-0">CRUD Categorias</h4>
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

    const verifiedBodyTemplate = (rowData) => {
        return <i key={Math.random()} className={classNames('pi', { 'text-green-500 pi-check-circle': !rowData.borradoLogico, 'text-red-500 pi-times-circle': rowData.borradoLogico })}></i>;
    };
    
    return (
        <div className="cuerpoCategories">
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
                    <Column field="id" header="Id" sortable style={{ minWidth: '8rem' }}></Column>
                    <Column field="descripcion" header="Descripcion" sortable style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>
            <Dialog visible={fichaRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Ficha Acceso" modal className="p-fluid" footer={fichaDialogFooter} onHide={hideDialog}>
                <div className="field" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="lectura" className="font-bold" style={{ width: '100px', marginRight: '1.5em' }}>Lectura</label>
                    <InputText id="descripcion" value={dataRegistroState.descripcion} onChange={(e) => onInputChange(e.target.value, 'descripcion')} required autoFocus className={classNames({ 'p-invalid': submitted && !dataRegistroState.descripcion })} />
                    {submitted && !dataRegistroState.descripcion && <small className="p-error">Descripcion es requerido.</small>}
                </div>
            </Dialog>
            <Dialog visible={deleteRegistroDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteFichaDialogFooter} onHide={hideDeleteRegistroDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && (
                        <span>
                            Esta seguro de Borrar la Categoria <b>{dataRegistroState.descripcion}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog visible={deleteRegistrosDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteListaDialogFooter} onHide={hideDeleteRegistrosDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {dataRegistroState && <span>Esta Seguro de Eliminar las Categorias Seleccionados?</span>}
                </div>
            </Dialog>
        </div>
    );
}
        