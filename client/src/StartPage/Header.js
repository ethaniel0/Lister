import { Link } from 'react-router-dom';
import { FaPlusCircle } from 'react-icons/fa'
import { useState } from 'react';
import { useHistory } from "react-router-dom";
import Modal from './Modal';
import Menu from './Menu';

const Header = ({ showModal, setModal, logged, name, uid, menu, showMenu }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [valPassword, setValPassword] = useState(false);
    const [error, setError] = useState("");
    
    const history = useHistory();
    const switchType = () => {
        if (valPassword === false) setValPassword("");
        else setValPassword(false);
    }
    const modalClick = (e) => {
        e.stopPropagation();
    }
    const logIn = () => {
        console.log(email, password);
        let body = {
            login: valPassword === false,
            username: email,
            password: password,
            pass2: valPassword || ""
        }
        console.log(body);
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(resp => resp.json()).then(json => {
            if (json.error) setError('*' + json.error);
            else if (json.success) history.push(json.success);
        });
    }
    
    return (
        <>
                <nav id='desktop-nav' className='absolute flex justify-between items-center sticky bg-white p-2 m-8 px-v5 box-border z-50'>
                <span className='flex items-center'>
                    <img src="/images/bilogo.png" alt="logo" className="h-12 mr-2" />
                    <span className='font-medium text-2xl'>Bring It</span>
                </span>
                <div className='text-2xl'>
                    <Link to="/">About Us</Link>
                </div>
                <div className='flex items-center'>
                    {
                        <div>
                            {
                            !logged 
                            ? <span onClick={() => setModal(true)} className='text-blue-500 text-2xl mr-6 cursor-pointer no-underline'>Login</span>
                            : <span onClick={() => showMenu(!menu)} id='username' className='text-blue-500 text-2xl mr-6 cursor-pointer no-underline'>{name}</span>
                            }
                            <Menu uid={uid} menu={menu} />
                        </div>
                    }
                    
                    <div id="new-list-button" className="new-list flex items-center text-xl text-white bg-blue-500 px-3 py-2 rounded-3xl cursor-pointer">
                        <FaPlusCircle />
                        <Link to="/makelist" className='inline-block ml-2'>New List</Link>
                    </div>
                </div>
            </nav>

            <Modal setModal={setModal} showModal={showModal} setEmail={setEmail} email={email} 
                   setPassword={setPassword} password={password} setValPassword={setValPassword} valPassword={valPassword} 
                   switchType={switchType} logIn={logIn} error={error} modalClick={modalClick} />
        </>
        
    )
}

Header.defaultProps = {
    showModal: false,
    user: null
}

export default Header
