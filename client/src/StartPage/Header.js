import { Link } from 'react-router-dom';
import { FaPlusCircle } from 'react-icons/fa'
import { useState } from 'react';
import { useHistory } from "react-router-dom";

const Header = ({ user, showModal, setModal }) => {
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
                <nav id='desktop-nav' className='flex justify-between items-center sticky bg-white p-2 m-8 px-v5 box-border'>
                <span className='flex items-center'>
                    <img src="/images/bilogo.png" alt="logo" className="h-12 mr-2" />
                    <span className='font-medium text-2xl'>Bring It</span>
                </span>
                <div className='text-2xl'>
                    <Link to="/">About Us</Link>
                </div>
                <div className='flex items-center'>
                    {
                        user == null 
                        ? <span onClick={() => setModal(true)} className='text-blue-500 text-2xl mr-6 cursor-pointer no-underline'>Login</span>
                        : <Link to={'/profile' + user.id} className='text-blue-500 text-2xl mr-6 cursor-pointer no-underline'>{user.name}</Link>
                    }
                    
                    <div id="new-list-button" className="new-list flex items-center text-xl text-white bg-blue-500 px-3 py-2 rounded-3xl cursor-pointer">
                        <FaPlusCircle />
                        <Link to="/makelist" className='inline-block ml-2'>New List</Link>
                    </div>
                </div>
            </nav>

            <div id='login-modal' onClick={() => setModal(false)} className={'box-border absolute justify-center items-center left-0 top-0 w-full h-full ' + (showModal ? 'flex' : 'hidden')}>
                <div id='inner-login-modal' onClick={modalClick} className='flex flex-col justify-center relative p-4 rounded-lg bg-gray-100 border-2 border-gray-300'>
                    <div>
                        <div className='text-3xl font-bold mb-8'>Log in</div>
                        <div className="text-right">
                            <span id="login-error" style={{display: (error === "" ? 'none' : "block")}} className='text-red-600 font-semibold text-xs text-right'>{error}</span>
                        </div>
                        <div className='font-bold mb-2'>Email</div>
                        <input id='login-user' type='text' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email or Username' className="p-2 border-0 border-b-2 border-black w-full bg-gray-50 shadow-md outline-none mb-6 rounded-t-lg" required />
                        <div className='font-bold mb-2'>Password</div>
                        <input id='login-pass' type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 border-0 border-b-2 border-black w-full bg-gray-50 shadow-md outline-none mb-6 rounded-t-lg" required />
                        <div id="modal-confirm-pass" style={{display: (valPassword === false ? 'none' : 'block')}}>
                            <span className='font-bold mb-2'>Confirm Password</span>
                            <input id='login-pass2' type='password' value={valPassword} onChange={(e) => setValPassword(e.target.value)} placeholder='Confirm Password' className="p-2 border-0 border-b-2 border-black w-full bg-gray-50 shadow-md outline-none mb-6 rounded-t-lg" required />
                        </div>
                        <div className="center">
                            <button id="login-submit" onClick={logIn} className="px-6 py-2 rounded-full text-white text-xl cursor-pointer mb-3">Log In</button>
                        </div>
                        <span id='login-signin' className='signin block w-full text-right'>{valPassword === false ? "Don't have an account? " : "Have an account? "}<span onClick={switchType} className='text-blue-600 cursor-pointer font-bold'>{valPassword === false ? "Create an account " : "Log in "}</span></span>
                    </div>
                </div>
            </div>
        </>
        
    )
}

Header.defaultProps = {
    showModal: false,
    user: null
}

export default Header
