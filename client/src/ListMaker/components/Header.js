import ContentEditable from 'react-contenteditable';
import { useHistory } from "react-router-dom";

const Header = ({ name, setName }) => {
    const history = useHistory();
    return (
        <div style={{backgroundSize: "cover", backgroundImage: "url(https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg)"}} className="h-32 w-full  flex justify-center relative">
            <ContentEditable 
                   html={name}
                   onChange={(e) => setName(e.target.value)}
                   style={{fontFamily: 'Oregano'}}
                   className='bg-white absolute bottom-0 px-12 text-4xl pt-3 rounded-t-3xl outline-none' />
            <img 
                onClick={() => history.push("/")}
                src='/images/bilogo.png' 
                alt="Bringit" 
                className='absolute top-3 left-2 w-12 filter border-white border-2 rounded-full cursor-pointer' />
            <img 
                src='/images/pfpic.png'
                alt="Profile"
                className='absolute top-3 left-16 w-12 cursor-pointer' />
        </div>
    )
}

export default Header
