/* eslint-disable no-unused-vars */
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';  
import { useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';

import React, {useState } from "react";
import { Button } from 'primereact/button';
import axios from 'axios';
import Login from './user/Login';

export default function MenuBar() {
    const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
    const userLogueado= useSelector((state) => state.login.user);
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const urlBackEndData = import.meta.env.VITE_API_BASE_URL;

    const handleAcceder = async (credenciales) => {
        let {usuario, password} = credenciales;
        try {
            if (usuario && password) {
                let response = await ( await axios.post(`${urlBackEndData}/usuarios/search/`, credenciales)).data;
                if (response.data.length > 0) {
                    dispatch({type: 'login/loginSuccess', payload: response.data[0]});
                }else {
                    dispatch({type: 'login/loginFailure', payload: 'Error: Credenciales incorrectas'});
                }
            }
        }catch (error) {
            dispatch({type: 'login/loginFailure', payload: 'Error: Credenciales incorrectas'});
        }
    };
    const handleLogout = () => {
        dispatch({type: 'login/logout'});
    }
    const navigate = useNavigate();
    const itemRenderer = (item) => (
            <a className="flex align-items-center p-menuitem-link" style={{ textDecoration: 'none' }}>
                <span className={item.icon} />
                <span className="mx-2">{item.label}</span>
            </a>
    );
    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => navigate('/'),
        },
        {
            label: 'Media',
            icon: 'pi pi-images',
            command: () => navigate('/media'),
        },
        {
            label: 'CRUD',
            icon: 'pi pi-pencil',
            template: itemRenderer,
            items: [
                {
                    label: 'Usuarios',
                    icon: 'pi pi-users',
                    command: () => {isLoggedIn && navigate('/usuarios');},
                    template: itemRenderer
                },
                {
                    label: 'Accesos',
                    icon: 'pi pi-lock',
                    command: () => {isLoggedIn && navigate('/accesos');},
                    template: itemRenderer
                },
                {
                    separator: true
                },
                
                {
                    label: 'Categories',
                    icon: 'pi pi-images',
                    command: () => {isLoggedIn && navigate('/categorias');},
                    template: itemRenderer
                },
                {
                    label: 'Media',
                    icon: 'pi pi-images',
                    command: () => {isLoggedIn && navigate('/medias');},
                    template: itemRenderer
                }
            ]
        }
    ];
    const start = <img alt="logo" src={`${urlBackEndData}/media/fotos/frank.png`} height="60" className="mr-2"></img>;
    const end = (
        <div className="flex align-items-center gap-2">
            {isLoggedIn===true && <Button label="Logout" icon="pi pi-sign-out" size='large' onClick={handleLogout} />}
            {isLoggedIn===false && <Button label="Login" icon="pi pi-sign-in" size="large" onClick={() => setVisible(true)} />}
            <Login visible={visible} setVisible={setVisible} handleAcceder={handleAcceder} />
            {isLoggedIn===false && <Avatar icon="pi pi-user" className="mr-2" size="xlarge" shape="circle" />}
            {isLoggedIn===true && <Avatar image={`${urlBackEndData}/media/usuarios/${userLogueado.urlFoto}`} shape="circle" size='xlarge'/>}
        </div>
    );
    
    return (
        <div className="card">
          <Menubar model={items} start={start} end={end}  />
        </div>
    );
}