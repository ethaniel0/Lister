import Header from './Header'
import { FaPlus } from 'react-icons/fa'
import './Profile.css';
import { useHistory } from "react-router-dom";

const Profile = ({ lists, makeList }) => {
    const history = useHistory();
    const tempId = () => Math.floor(Math.random() * 100000);
    const newList = () => {
        let id = tempId();
        let add = {
            id: id,
            name: "New List",
            image: "https://cdn-icons-png.flaticon.com/512/149/149347.png"
        };
        makeList(add);
        history.push("/makelist");
    }
    return (
        <>
            <Header />
            <main className='text-center mt-8'>
                <h2 className='text-3xl'>Lists</h2>
                <div id="lists" class='p-5 flex justify-center'>
                    {
                        lists.map((list) => (
                            <div style={{backgroundImage: 'url(' + list.image +')', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}  className="listDiv w-60 h-60 border-2 border-gray-200 border-dotted shadow-lg flex flex-col items-center justify-end">
                                <span className='bg-white w-full p-1 bg-opacity-60 text-xl'>{list.name}</span>
                            </div>
                        ))
                    }
                    <div onClick={newList} className="listDiv w-60 h-60 border-2 border-dotted shadow-lg p-2 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-200  transition-colors duration-300 cursor-default">
                            <FaPlus className="block text-5xl mb-4 text-gray-500" />
                            <span className="text-2xl text-gray-400">New List</span>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Profile
