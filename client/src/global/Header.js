import { Link } from 'react-router-dom';
import { FaPlusCircle } from 'react-icons/fa'
import { useState } from 'react';
import { useHistory } from "react-router-dom";
import Modal from './Modal'; // login modal
import Menu from './Menu'; // profile options when clicking on name

const Header = ({ showModal, setModal, logged, name, uid, menu, showMenu, profPic }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [valPassword, setValPassword] = useState(false);
    const [error, setError] = useState("");
    
    const history = useHistory();

    // switch between login and signup
    const switchType = () => {
        if (valPassword === false) setValPassword("");
        else setValPassword(false);
    }

    // don't close modal when modal is clicked
    const modalClick = (e) => {
        e.stopPropagation();
    }

    // log into account (within modal)
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

    // create a new list
    const newList = () => {
        if (!logged){
            history.push('/makelist/untitled');
            return;
        }
        fetch('/api/newList/' + uid,
        { method: 'POST' }).then(resp => resp.json()).then(json => {
            console.log(json);
            if (json.success) history.push('/makeList/' + uid + '/' + json.success);
        })
    }
    
    return (
        <>
            <nav id='desktop-nav' className='absolute flex justify-between items-center sticky bg-white p-2 m-2 sm:m-8 px-v5 box-border z-50'>
                <span onClick={() => history.push('/')} className='flex items-center cursor-pointer'>
                    <img src="/images/bilogo.png" alt="logo" className="h-12 mr-2" />
                    <span className='font-medium text-2xl'>Bring It</span>
                </span>
                {/* about us */}
                <div className='text-2xl hidden sm:block'>
                    <Link to="/">About Us</Link>
                </div>
                {/* menu */}
                <div className='flex items-center hidden sm:flex'>
                    {
                        <div>
                            {
                            !logged 
                            ? <span onClick={() => setModal(true)} className='text-blue-500 text-2xl mr-6 cursor-pointer no-underline'>Login</span>
                            : <span onClick={() => showMenu(!menu)} id='username' className='text-blue-500 text-2xl mr-6 cursor-pointer no-underline'>{name}</span>
                            }
                            <Menu uid={uid} menu={menu} makeList={() => {}} />
                        </div>
                    }
                    
                    <div id="new-list-button" className="new-list flex items-center text-xl text-white bg-blue-500 px-3 py-2 rounded-3xl cursor-pointer hidden sm:flex">
                        <FaPlusCircle />
                        <span onClick={newList} className='inline-block ml-2 cursor-pointer'>New List</span>
                    </div>
                </div>
                <div className='block sm:hidden'>
                    
                    {
                    !logged 
                    ? <span onClick={() => setModal(true)} className='text-blue-500 text-2xl mr-6 cursor-pointer no-underline'>Login</span>
                    : <img onClick={() => showMenu(!menu)} src={profPic} alt="profile" className='w-14 h-14 object-cover cursor-pointer rounded-full' />
                    }
                    <Menu uid={uid} menu={menu} makeList={() => {}} />
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
