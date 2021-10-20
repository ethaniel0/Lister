import { useHistory } from "react-router-dom";
import { FaEdit } from 'react-icons/fa';

const Header = ({ name, uid, listid, owner, topPic, profPic }) => {
    const history = useHistory();
    return (
        <div style={{backgroundSize: "cover", backgroundImage: `url(${topPic})`}} className="h-32 w-full  flex justify-center relative">
            <div style={{fontFamily: 'Oregano'}} className='bg-white absolute bottom-0 px-12 text-4xl pt-3 rounded-t-3xl outline-none'>{name}</div>
            <img 
                onClick={() => history.push("/")}
                src='/images/bilogo.png' 
                alt="Bringit" 
                className='absolute top-3 left-2 w-12 filter border-white border-2 rounded-full cursor-pointer' />
            <img 
                onClick={() => history.push("/profile/" + uid)}
                src={profPic}
                alt="Profile"
                className='absolute top-3 left-16 w-12 cursor-pointer rounded-full' />
            {owner && <FaEdit onClick={() => history.push(`/makelist/${uid}/${listid}`)} className='absolute right-4 top-4 text-2xl cursor-pointer gear  bg-white box-content p-1 rounded-lg border-black border-2' />}
            
        </div>
    )
}

export default Header
