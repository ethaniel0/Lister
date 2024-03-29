import Header from './Header';
import './settings.css';
import { useHistory, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';

const Settings = () => {
    const { uid } = useParams();
    const history = useHistory();
    const [profile, setProfile] = useState({
        name: "",
        profPic: "/images/pfpic.png",
        topPic: "https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg",
        email: "",
        plan: ""
    });
    const [profChanged, setChange] = useState(false);

    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState(false);
    const [curPass, setCurPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confPass, setConfPass] = useState("");

    const [unameError, setUnameError] = useState('');
    const [unameSuccess, setUnameSuccess] = useState(false);
    const [username, setUsername] = useState("");
    const [changeUsername, setChangeUsername] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const [changeEmail, setChangeEmail] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteInput, setDeleteInput] = useState('')

    function toTitleCase(str) {
        return str.replace(
          /\w\S*/g,
          function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          }
        );
    }

    useEffect(() => {
        let isMounted = true;
        fetch('/api/profile/' + uid + '/settings').then(res => res.json()).then(json => {
            if (json.error) return history.push('/');
            if (isMounted) setProfile(json);
            setChange(false);
        });
        return () => { isMounted = false };
    }, [history, uid, profChanged]);

    const uploadFile = (e, track, callback) => {
        e.preventDefault();
        let file = e.target.files[0];
        let formData = new FormData();
        formData.append('file', file);
        console.log(formData);
        fetch(`/api/edit/${uid}/${track}`, {
            method: 'POST',
            body: formData
        })
        .then(resp => resp.json())
        .then(callback)
    };

    const uploadTopPic = (e) => {
        uploadFile(e, 'uploadMainImage', (data) => {
            if (data.errors) alert(data.errors);
            else setProfile({...profile, topPic: data.url});
        })
    }
    const uploadProfPic = (e) => {
        uploadFile(e, 'uploadProfPic', (data) => {
            if (data.errors) alert(data.errors);
            else setProfile({...profile, profPic: data.url});
        })
    }

    const changePassword = () => {
        setPassError("");
        fetch('/api/profile/' + uid + '/settings/setPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                curPassword: curPass, 
                newPassword: newPass, 
                confPassword: confPass
            })
        }).then(res => res.json()).then(json => {
            if ('error' in json){
                setPassError(json.error);
                setPassSuccess(false);
            }
            else if ('success' in json){
                setPassError(json.success);
                setPassSuccess(true);
            }
        });
    }

    const subChangeUsername = () => {
        // setUnameError("");
        fetch('/api/profile/' + uid + '/settings/setUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        }).then(res => res.json()).then(json => {
            if ('error' in json){
                setUnameError(json.error);
                setUnameSuccess(false);
            }
            else if ('success' in json){
                setUnameError(json.success);
                setUnameSuccess(true);
                setChangeUsername(false);
                setProfile({...profile, name: username});
            }
        });
    }

    const subChangeEmail = () => {
        // setEmailError("");
        fetch('/api/profile/' + uid + '/settings/setEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        }).then(res => res.json()).then(json => {
            if ('error' in json){
                setEmailError(json.error);
                setEmailSuccess(false);
            }
            else if ('success' in json){
                setEmailError(json.success);
                setEmailSuccess(true);
                setChangeEmail(false);
                setProfile({...profile, email: email});
            }
        });
    }

    const deleteAccount = () => {
        console.log('deleting');
        fetch('/api/deleteAccount/' + uid, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(json => {
            if (json.success){
                history.push('/');
            }
            else {
                console.log(json);
            }
        })
    }

    return (
        <div className='relative flex flex-col' style={{height: '100vh'}}>
            <Header uid={uid} topPic={profile.topPic} profPic={profile.profPic} uploadFile={uploadTopPic} />

            <div className='flex flex-grow flex-col items-center justify-start'>
                {/* modal */}
                <div className='absolute bg-white p-6 rounded-lg flex flex-col items-center border-2 border-black' style={{top: deleteModal ? '50%' : '-100vh', transform: 'translateY(-50%)'}}>
                    <span className='text-2xl mb-4'>Are you sure you want to delete your account?</span>
                    <span className='text-xl mb-4'>Please type your account name in the space below.</span>
                    <input onChange={(e) => {setDeleteInput(e.target.value)}} id='verify-delete' type="text" placeholder='Account Name' value={deleteInput} className='w-full' />
                    <div>
                        <button onClick={deleteAccount} className={'mt-8 px-2 py-1 rounded-md border-2 transition-colors duration-300' + (deleteInput === profile.name ? ' border-transparent bg-red-600 text-white' :' border-red-300 bg-red-200 text-black')}>Delete Account</button>
                        <button onClick={() => setDeleteModal(false)} className='ml-8 px-2 py-1 rounded-md border-2 border-blue-600 bg-blue-600 text-white transition-colors duration-300'>Cancel</button>
                    </div>
                </div>
                <img
                    onClick={(e) => {e.stopPropagation(); document.getElementById('profPicFileUpload').click()}}
                    src={profile.profPic}
                    alt="Profile page"
                    className='w-32 h-32 object-cover mt-12 cursor-pointer rounded-full' />
                <span onClick={(e) => {e.stopPropagation(); document.getElementById('profPicFileUpload').click()}} className='text-blue-700 cursor-pointer'>Change profile picture</span>
                <input onChange={uploadProfPic} type="file" className="hidden" id="profPicFileUpload" accept="image/png, image/jpeg" />
                <table id='settings-table' className='mt-5'>
                    <tbody>
                        {/* username */}
                        <tr>
                            <td>Username</td>
                            <td className='flex flex-col'>
                                <div>
                                    <span>{profile.name}</span>
                                    <button onClick={() => {setChangeUsername(!changeUsername)}} className='text-base ml-4 bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Change username</button>
                                </div>
                                <span className={'text-base ' + (unameSuccess ? 'text-green-500' : 'text-red-500')}>{unameError}</span>
                                <div className={'text-base flex flex-col' + (changeUsername ? '' : ' hidden')}>
                                    <input onChange={(e) => setUsername(e.target.value)} id='change-username'  type="text" placeholder='New username' value={username} />
                                    <div>
                                        <button onClick={subChangeUsername} className='bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Update username</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {/* email */}
                        <tr>
                            <td>Email</td>
                            <td className='flex flex-col'>
                                <div>
                                    <span>{profile.email}</span>
                                    <button onClick={() => {setChangeEmail(!changeEmail)}} className='text-base ml-4 bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Change email</button>
                                </div>
                                <span className={'text-base ' + (emailSuccess ? 'text-green-500' : 'text-red-500')}>{emailError}</span>
                                <div className={'text-base flex flex-col' + (changeEmail ? '' : ' hidden')}>
                                    
                                    <input onChange={(e) => setEmail(e.target.value)} id='change-email' type="text" placeholder='New email' value={email} />
                                    <div>
                                        <button onClick={subChangeEmail} className='bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Update email</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {/* account type */}
                        <tr>
                            <td>Account Type</td>
                            <td><span>Personal</span> <span className='ml-4 text-base text-blue-700 cursor-pointer'>Start an organization</span></td>
                        </tr>
                        {/* plan type */}
                        <tr>
                            <td>Plan</td>
                            <td><span>{toTitleCase(profile.plan)}</span> <span className='ml-4 text-base text-blue-700  cursor-pointer'>Get more out of Bringit</span></td>
                        </tr>
                        {/* password */}
                        <tr>
                            <td>Reset Password</td>
                            <td id='password-reset-inputs' className='flex flex-col text-base'>
                                <span className={passSuccess ? 'text-green-500' : 'text-red-500'}>{passError}</span>
                                <input onChange={(e) => setCurPass(e.target.value)} type="password" placeholder='Old password' value={curPass} />
                                <input onChange={(e) => setNewPass(e.target.value)} type="password" placeholder='New password' value={newPass} />
                                <input onChange={(e) => setConfPass(e.target.value)} type="password" placeholder='Confirm password' value={confPass} />
                                <div className='flex justify-between mt-1'>
                                    <button onClick={changePassword} className='bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Update password</button>
                                    <span className='text-blue-700  cursor-pointer'>I forgot my password</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <button onClick={() => setDeleteModal(true)} className='mt-8 bg-red-600 text-white px-2 py-1 rounded-md border-white border-2 hover:border-red-600 hover:bg-red-200 hover:text-black transition-colors duration-300'>Delete Account</button>
            </div>
        </div>
    )
}

export default Settings
