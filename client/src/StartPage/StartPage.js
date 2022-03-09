import './StartPage.css';
import { useState, useEffect } from 'react';
import DemoCard from './DemoCard';
import Header from '../global/Header';
import { useHistory } from "react-router-dom";



function StartPage() {
    const [demo, editDemo] = useState({
        id: 1,
        name: "Packing List",
        color: "blue",
        items: [
            {
                id: 1,
                text: "Notebook",
                checked: false
            },
            {
                id: 2,
                text: "Pencils",
                checked: false
            },
            {
                id: 3,
                text: "Toothbrush",
                checked: false
            },
            {
                id: 4,
                text: "Toothpaste",
                checked: false
            },
            {
                id: 5,
                text: "Towel",
                checked: false
            }
        ]
    });
    const [search, editSearch] = useState("");

    const history = useHistory();

    const [modal, showModal] = useState(false);
    const [loggedIn, setLogged] = useState(false);
    const [name, setName] = useState("");
    const [uid, setUid] = useState("");
    const [profPic, setProfPic] = useState("");
    const [menu, showMenu] = useState(false);

    const onEdit = (ind, checked) => {
        console.log(ind);
        let d = Object.assign({}, demo);
        d.items[ind].checked = checked;
        editDemo(d);
    }

    useEffect(() => {
        let isMounted = true;
        fetch('/testsession').then(res => res.json()).then(json => {
            console.log(json);
            if (isMounted && !('error' in json)){
                console.log('logged in');
                let { name, uid, profPic } = json;
                setName(name);
                setUid(uid);
                setProfPic(profPic);
                setLogged(true);
            }
        });
        return () => { isMounted = false };
    }, [])

    const bodyClick = (e) => {
        let el = document.getElementById('header-menu');
        let name = document.getElementById('username');
        if (el && name && !el.contains(e.target) && !name.contains(e.target)) {
            showMenu(false);
        }
    };

    const goToSearch = () => {
        history.push('/search/' + search);
    }

  return (
    <div onClick={bodyClick}>  
        <Header showModal={modal} setModal={showModal} logged={loggedIn} name={name} uid={uid} menu={menu} showMenu={showMenu} profPic={profPic} />
        
        <main className='text-center transition duration-300' style={{filter: (modal ? "blur(10px)" : 'blur(0)')}}>
            {/* all content inside main */}
            <div id="cont" className='flex'>

                {/* left side */}
                <div className='n1 pl-20 flex items-center flex-grow' style={{height: '70vh', width: '100%'}}>
                    {/* container so left-side content is vertically centered */}
                    <div className='text-left w-full'>
                        <h1 className="text-left w-full font-bold text-7xl mt-0 mb-4">Bring it.</h1>
                        <span className='block mb-16 text-4xl font-thin'>Know you're ready.<br />For real this time.</span>
                        <div id='title-search' className='flex rounded-full justify-between items-center px-2'>
                            <input onChange={(e) => editSearch(e.target.value)} type='text' value={search} placeholder='Find Your Packing List' className='p-4 border-none block outline-none mb-0 rounded-full flex-grow' />
                            <button onClick={goToSearch} className='relative text-white border-none mt-0 bg-blue-500 py-2 px-5 h-10 rounded-full shadow-lg'>Search</button>
                        </div>
                    </div>
                </div>
                
                {/* right side with demo card */}
                <div className='sm:pr-20 flex items-center justify-center flex-grow'>
                    <DemoCard card={demo} onEdit={onEdit} />
                </div>
                
            </div>
        </main>
    </div>
  );
}

StartPage.defaultProps = {
    user: null
}

export default StartPage;
