import Header from './Header'
import List from './List';
import { FaPlus } from 'react-icons/fa'
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
        });
        return () => { isMounted = false };
    }, [history, uid]);

    const goToList = (listid) => {
        history.push(`/list/${uid}/${listid}`);
    }
    
    return (
        <div onClick={() => setMenu(-1)}>
            <Header name={profile.name} profPic={profile.profPic} topPic={profile.topPic} />
            <main className='text-center mt-8'>
                <h2 className='text-3xl'>My Lists</h2>
                <div id="lists" className='p-5 flex justify-center'>
                    {
                        profile.personalLists.map((list, ind) => (
                            <List key={list.id} id={list.id} ind={ind} image={list.image} name={list.name} isPublic={list.public} goToList={goToList} showItemMenu={showItemMenu === ind} setItemMenu={setMenu} uid={uid} profile={profile} />
                        ))
                    }
                    {
                        profile.owner &&
                        <div onClick={newList} className="listDiv w-60 h-60 border-2 border-dotted shadow-lg p-2 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-200  transition-colors duration-300 cursor-default">
                                <FaPlus className="block text-5xl mb-4 text-gray-500" />
                                <span className="text-2xl text-gray-400">New List</span>
                        </div>
                    }
                </div>

                <h2 className='text-3xl'>Saved Lists</h2>
                <div id="lists" className='p-5 flex justify-center'>
                    {
                        savedLists.map((list) => (
                            <div key={list.id} style={{backgroundImage: 'url(' + list.image +')', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}  className="listDiv w-60 h-60 border-2 border-gray-200 border-dotted shadow-lg flex flex-col items-center justify-end">
                                <span className='bg-white w-full p-1 bg-opacity-60 text-xl'>{list.name}</span>
                            </div>
                        ))
                    }
                </div>
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
