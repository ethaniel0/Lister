import Header from './Header';
import { useHistory, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';

const Settings = () => {
    const { uid } = useParams();
    const history = useHistory();
    const [profile, setProfile] = useState({
        name: "Duke University",
        personalLists: [],
        profPic: "/images/pfpic.png",
        topPic: "https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg",
        owner: false
    });
    const [profChanged, setChange] = useState(false);

    useEffect(() => {
        let isMounted = true;
        fetch('/api/profile/' + uid).then(res => res.json()).then(json => {
            if (json.error) return history.push('/');
            if (isMounted) setProfile(json);
            setChange(false);
        });
        return () => { isMounted = false };
    }, [history, uid, profChanged]);

    return (
        <div>
            <Header name={profile.name} uid={uid} topPic={profile.topPic} profPic={profile.profPic} />
            <div className='flex'>
                <div>
                    
                </div>
                <div>

                </div>

            </div>
        </div>
    )
}

export default Settings
