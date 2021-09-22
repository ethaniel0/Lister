import './index.css';
// import './ListMaker.css';
import { useState } from 'react';
import DemoCard from './DemoCard';
import { Link } from 'react-router-dom';

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

    const onEdit = (ind, checked) => {
        console.log(ind);
        let d = Object.assign({}, demo);
        d.items[ind].checked = checked;
        editDemo(d);
    }

  return (
    <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet"></link>
        
        <nav id='desktop-nav' class='flex justify-between items-center sticky bg-white p-2 m-8 px-v5 box-border'>
            <span class='flex items-center'>
                <img src="/images/bilogo.png" alt="logo" class="h-16 mr-4" />
                <span class='font-medium text-2xl'>Bring It</span>
            </span>
            <div class='text-2xl'>
                <a href="/">Our Story idk</a>
            </div>
            <div class='flex items-center'>
                <a href='/' class='text-blue-500 text-2xl mr-6 cursor-pointer no-underline' onclick='loginModal()'>Login</a>
                <div class="new-list text-xl text-white bg-blue-500 px-3 py-2 rounded-3xl cursor-pointer transition-colors transition-transform duration-500">
                    <i class="fas fa-plus-circle"></i>
                    <Link to="/makeList">New List</Link>
                </div>
            </div>
        </nav>

        <main class='text-center'>
            <div id="cont" className='flex'>
                <div className='n1 pl-20 flex items-center flex-grow' style={{height: '70vh', width: '100%'}}>
                    <div>
                    <h1 className="text-left w-full font-extrabold text-7xl mt-0 mb-4">Bring it.</h1>
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
      {/* Hello, this is the front page */}
    </>
  );
}

export default StartPage;
