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

    const editName = (name) => {
        setProfile({...profile, name: name});
        fetch(`/api/edit/${uid}/editName`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        });
      }

    return (
        <div className='relative flex flex-col' style={{height: '100vh'}}>
            <Header name={profile.name} uid={uid} topPic={profile.topPic} profPic={profile.profPic} uploadFile={uploadFile} setName={editName} />

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
                                <input type="text" placeholder='Old password' />
                                <input type="text" placeholder='New password' />
                                <input type="text" placeholder='Confirm password' />
                                <div className='flex justify-between mt-1'>
                                    <button className='bg-blue-300 px-2 py-1 rounded-md border-white border-2 hover:border-blue-600 hover:bg-blue-200 transition-colors duration-300'>Update password</button>
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
