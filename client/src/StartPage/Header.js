import { Link } from 'react-router-dom';
import { FaPlusCircle } from 'react-icons/fa'

const Header = ({ user, showModal, setModal }) => {
    console.log('show:', showModal);
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

            <div id='login-modal' className={'box-border absolute justify-center items-center left-0 top-0 w-full h-full ' + (showModal ? 'flex' : 'hidden')}>
                <form id='inner-login-modal' className='flex flex-col justify-center relative p-4 rounded-lg bg-gray-50 border-2 border-gray-100'>
                    <div>
                        <span>Log in</span>
                        <div className="text-right">
                            <span id="login-error" style={{display: 'none'}}></span>
                        </div>
                        <span>Email</span>
                        <input id='login-user' type='text' placeholder='Email or Username' required />
                        <span>Password</span>
                        <input id='login-pass' type='password' placeholder='Password' required />
                        <div id="modal-confirm-pass" style={{display: 'none'}}>
                            <span>Confirm Password</span>
                            <input id='login-pass2' type='password' placeholder='Confirm Password' required />
                        </div>
                        <div className="center">
                            <button id="login-submit">Log In</button>
                        </div>
                        <span id='login-signin' className='signin'>Don't have an account? <span>Create an account</span></span>
                    </div>
                </form>
            </div>
        </>
        
    )
}

Header.defaultProps = {
    showModal: false,
    user: null
}

export default Header
