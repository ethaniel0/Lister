import './StartPage.css';
import { useState } from 'react';
import DemoCard from './DemoCard';
import Header from './Header';



function StartPage({ user }) {
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

    const [modal, showModal] = useState(false);

    const onEdit = (ind, checked) => {
        console.log(ind);
        let d = Object.assign({}, demo);
        d.items[ind].checked = checked;
        editDemo(d);
    }

  return (
    <>  
        <Header user={user} showModal={modal} setModal={showModal} />
        
        <main className='text-center transition duration-300' style={{filter: (modal ? "blur(10px)" : 'blur(0)')}}>
            <div id="cont" className='flex'>
                <div className='n1 pl-20 flex items-center flex-grow' style={{height: '70vh', width: '100%'}}>
                    <div className='text-left w-full'>
                        <h1 className="text-left w-full font-bold text-7xl mt-0 mb-4">Bring it.</h1>
                        <span className='block mb-16 text-4xl font-thin'>Know you're ready. For<br />Real this time.</span>
                        <div id='title-search-container'>
                            <input id='title-search' type='text' placeholder='Find Your Packing List' className='p-4 border-none block outline-none mb-0' />
                            <button className='relative text-white border-none mt-0 bg-blue-500 py-2 px-5'>Search</button>
                        </div>
                    </div>
                </div>
                
                <div className='pr-20 flex items-center justify-center flex-grow'>
                    <DemoCard card={demo} onEdit={onEdit} />
                </div>
                
            </div>
        </main>
    </>
  );
}

StartPage.defaultProps = {
    user: null
}

export default StartPage;
