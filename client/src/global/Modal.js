
const Modal = ({ setModal, showModal, setEmail, email, setPassword, password, setValPassword, valPassword, switchType, logIn, error, modalClick }) => {
    return (
        <div id='login-modal' onClick={() => setModal(false)} className={'box-border absolute justify-center items-center left-0 top-0 w-full h-full ' + (showModal ? 'flex' : 'hidden')}>
            <div id='inner-login-modal' onClick={modalClick} className='flex flex-col justify-center relative p-4 rounded-lg bg-gray-100 border-2 border-gray-300'>
                    <div>
                        <div className='text-3xl font-bold mb-8'>Log in</div>
                        <div className="text-right">
                            <span id="login-error" style={{display: (error === "" ? 'none' : "block")}} className='text-red-600 font-semibold text-xs text-right'>{error}</span>
                        </div>
                        <div className='font-bold mb-2'>Email</div>
                        <input id='login-user' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email or Username' className="p-2 border-0 border-b-2 border-black w-full bg-gray-50 shadow-md outline-none mb-6 rounded-none rounded-t-lg" required />
                        <div className='font-bold mb-2'>Password</div>
                        <input id='login-pass' type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 border-0 border-b-2 border-black w-full bg-gray-50 shadow-md outline-none mb-6 rounded-none rounded-t-lg" required />
                        <div id="modal-confirm-pass" style={{display: (valPassword === false ? 'none' : 'block')}}>
                            <span className='font-bold mb-2'>Confirm Password</span>
                            <input id='login-pass2' type='password' value={valPassword} onChange={(e) => setValPassword(e.target.value)} placeholder='Confirm Password' className="p-2 border-0 border-b-2 border-black w-full bg-gray-50 shadow-md outline-none mb-6 rounded-none rounded-t-lg" required />
                        </div>
                        <div className="center">
                            <button id="login-submit" onClick={logIn} className="px-6 py-2 rounded-full text-white text-xl cursor-pointer mb-3">Log In</button>
                        </div>
                        <span id='login-signin' className='signin block w-full text-right'>{valPassword === false ? "Don't have an account? " : "Have an account? "}<span onClick={switchType} className='text-blue-600 cursor-pointer font-bold'>{valPassword === false ? "Create an account " : "Log in "}</span></span>
                    </div>
                </div>
        </div>
    )
}

export default Modal
