import Header from '../global/Header';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from "react-router-dom";

const Browse = () => {

    const history = useHistory();
    const { query } = useParams();

    const [modal, showModal] = useState(false);
    const [loggedIn, setLogged] = useState(false);
    const [name, setName] = useState("");
    const [uid, setUid] = useState("");
    const [menu, showMenu] = useState(false);
    const [search, editSearch] = useState("");

    const bodyClick = (e) => {
        let el = document.getElementById('header-menu');
        let name = document.getElementById('username');
        if (el && name && !el.contains(e.target) && !name.contains(e.target)) {
            showMenu(false);
        }
    };

    const detectEnter = (e) => {
        if (e.key === 'Enter') history.push('/search/' + search);
    }

    useEffect(() => {
        let isMounted = true;
        fetch('/api').then(res => res.text()).then(text => { 
            console.log('TESTING');
            console.log(text);
        })
        fetch('/testsession').then(res => res.text()).then(json => {
            console.log(json);
            if (isMounted && !('error' in json)){
                console.log('logged in');
                let { name, uid } = json;
                setName(name);
                setUid(uid);
                setLogged(true);
            }
        });
        fetch('api/search/' + query).then(res => res.json()).then(json => {
            console.log(json);
            if (isMounted && !('error' in json)){
                console.log(json)
            }
        });
        return () => { isMounted = false };
    }, [query])

    return (
        <div onClick={bodyClick}>
            <Header showModal={modal} setModal={showModal} logged={loggedIn} name={name} uid={uid} menu={menu} showMenu={showMenu} />
            <main className='text-center transition duration-300' style={{filter: (modal ? "blur(10px)" : 'blur(0)')}}>
                <input onChange={(e) => editSearch(e.target.value)} onKeyPress={detectEnter} type="text" value={search} placeholder="Search" className="bg-gray-200 p-2 text-xl rounded-md mb-4 outline-none w-96 border-2 border-gray-400 " />
                <h1 className="text-xl font-thin">Search results for &quot;{query}&quot;</h1>
            </main>
        </div>
    )
}

export default Browse
