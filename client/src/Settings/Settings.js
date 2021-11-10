import Header from './Header';
import './settings.css';
import { useHistory, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';

const Settings = () => {
    const { uid } = useParams();
    const history = useHistory();
    const [profile, setProfile] = useState({
        name: "Duke University",
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

    const uploadFile = (e) => {
        e.preventDefault();
        let file = e.target.files[0];
        let formData = new FormData();
        formData.append('file', file);
        console.log(formData);
        fetch(`/api/edit/${uid}/uploadMainImage`, {
            method: 'POST',
            body: formData
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.errors) {
                alert(data.errors);
            }
            else {
                setProfile({...profile, topPic: data.url});
            }
        })
    };

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

    return (
        <div className='relative flex flex-col' style={{height: '100vh'}}>
            <Header uid={uid} topPic={profile.topPic} profPic={profile.profPic} uploadFile={uploadFile} />

            <div className='flex flex-grow justify-center items-start'>
                <table id='settings-table' className='mt-20'>
                    <tbody>
                        <tr>
                            <td>Email</td>
                            <td className='flex items-center'>
                                <span>{profile.email}</span>
                                <button className='text-base ml-4 bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Change email</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Username</td>
                            <td className='flex items-center'>
                                <span>{profile.name}</span>
                                <button className='text-base ml-4 bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Change username</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Account Type</td>
                            <td><span>Personal</span> <span className='ml-4 text-base text-blue-700 cursor-pointer'>Start an organization</span></td>
                        </tr>
                        <tr>
                            <td>Plan</td>
                            <td><span>{toTitleCase(profile.plan)}</span> <span className='ml-4 text-base text-blue-700  cursor-pointer'>Get more out of Bringit</span></td>
                        </tr>
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
            </div>
        </div>
    )
}

export default Settings
