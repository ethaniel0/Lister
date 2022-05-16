import Header from './Header'
import List from './List';
import { FaPlus, FaCog } from 'react-icons/fa'
import './Profile.css';
import { useHistory, useParams } from "react-router-dom";
import { useEffect, useState } from 'react';

const Profile = ({ savedLists }) => {
    const { uid } = useParams();
    const history = useHistory();
    const [profile, setProfile] = useState({
        name: "Duke University",
        personalLists: [],
        profPic: "/images/pfpic.png",
        topPic: "https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg",
        owner: false
    })
    const [profChanged, setChange] = useState(false);
    const [showItemMenu, setMenu] = useState(-1);
    const newList = () => {
        fetch('/api/newList/' + uid,
        { method: 'POST' }).then(resp => resp.json()).then(json => {
            console.log(json);
            if (json.success) history.push('/makelist/' + uid + '/' + json.success);
        })
    }
    useEffect(() => {
        let isMounted = true;
        fetch('/api/profile/' + uid).then(res => res.json()).then(json => {
            if (json.error) return history.push('/');
            if (isMounted) setProfile(json);
            setChange(false);
        });
        return () => { isMounted = false };
    }, [history, uid, profChanged]);

    const deleteList = (listid) => {
        fetch('/api/deleteList/' + uid + '/' + listid, { method: 'POST' }
        ).then(res => res.json()).then(json => {
            if (json.error) return history.push('/');
            setChange(true);
        });
    }
    const setPublic = (listid, isPublic) => {
        console.log('setting public:', isPublic);
        fetch('/api/edit/' + uid + '/' + listid + '/setPublic', { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isPublic })
        }
        ).then(res => res.json()).then(json => {
            if (json.error) return history.push('/');
            setChange(true);
        });
    }

    const goToList = (listid) => {
        history.push(`/list/${uid}/${listid}`);
    }

    
    return (
        <div onClick={() => setMenu(-1)} style={{minHeight: '100vh'}}>
            <Header name={profile.name} profPic={profile.profPic} topPic={profile.topPic} uid={uid} />
            <main className='text-center mt-8 relative'>
                <h2 className='text-3xl'>My Lists</h2>
                {/* Show your lists */}
                <div id="lists" className='p-5 flex flex-wrap justify-center'>
                    {/* Loop over all existing lists */}
                    {
                        profile.personalLists.map((list, ind) => (
                            <List key={list.id} list={list} ind={ind} goToList={goToList} showItemMenu={showItemMenu === ind} setItemMenu={setMenu} uid={uid} profile={profile} deleteList={() => deleteList(list.id)} setPublic={setPublic} />
                        ))
                    }
                    {/* Show the New List square */}
                    {
                        profile.owner &&
                        <div onClick={newList} style={{filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'}} className="listDiv w-60 h-60 p-2 flex flex-col items-center justify-center bg-blue-50 transition-colors duration-300 hover:bg-blue-200 cursor-default">
                                <FaPlus className="block text-5xl mb-4 text-gray-500" />
                                <span className="text-2xl text-gray-400">New List</span>
                        </div>
                    }
                </div>

                {/* Show your saved lists (from others) */}
                {
                    savedLists.length > 0 && 
                    <>
                    <h2 className='text-3xl'>Saved Lists</h2>
                    <div id="lists" className='p-5 flex justify-center'>
                        {
                            savedLists.map((list, ind) => (
                                <List key={list.id} list={list} ind={ind} goToList={goToList} showItemMenu={showItemMenu === ind} setItemMenu={setMenu} uid={uid} profile={profile} />
                            ))
                        }
                    </div>
                    </>
                }
                <FaCog onClick={() => history.push('/profile/' + uid + '/settings/')} id='settings' className='absolute top-0 right-8 text-2xl cursor-pointer transition duration-300' />
            </main>
        </div>
    )
}

Profile.defaultProps = {
    lists: [],
    makeList: () => {},
    savedLists: []
}


export default Profile
