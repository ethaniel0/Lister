import { Link } from 'react-router-dom';
import { useHistory } from "react-router-dom";


const Menu = ({ uid, menu }) => {

    const history = useHistory();

    function logout(){
        fetch('/logout').then(() => history.push('/'));
        console.log('logging out');
    }

    return (
        <div id='header-menu' style={{top: '3.5em'}} className={'absolute flex flex-col border-black border-2 rounded-lg text-lg bg-white' + (menu ? '' : ' hidden')}>
            <Link to={'/profile/' + uid} className='text-center py-2  px-6 hover:bg-gray-200 rounded-t-md'>Profile</Link>
            <hr />
            <Link to={'/profile/' + uid + '/settings'} className='text-center py-2 px-6 hover:bg-gray-200'>Settings</Link>
            <hr />
            <span onClick={logout} className='text-red-500 text-center py-2 px-6 hover:bg-gray-200 rounded-b-md'>Log Out</span>
        </div>
    )
}

export default Menu
