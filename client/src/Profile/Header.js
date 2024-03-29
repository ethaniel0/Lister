import { useHistory } from "react-router-dom";

const Header = ({ name, profPic, topPic, uid }) => {
    // console.log('pic:', topPic);
    const history = useHistory();
    return (
        <div style={{backgroundImage: ('url(' + topPic + ')'), backgroundSize: 'cover', backgroundPosition: 'center'}} className="h-32 w-full  flex justify-center relative">
            <div style={{fontFamily: 'Oregano'}}
                 className='bg-white absolute bottom-0 px-12 text-4xl pt-3 rounded-t-3xl'>
                    {name}
            </div>
            <img
                onClick={() => history.push("/")}
                src='/images/bilogo.png'
                alt="Bring It main page"
                className='absolute top-3 left-2 w-14 h-14 sm:w-12 sm:h-12 object-cover border-white border-2 rounded-full cursor-pointer' />
            <img
                onClick={() => history.push("/profile/" + uid)}
                src={profPic}
                alt="Profile page"
                className='absolute top-3 left-20 sm:left-16 w-14 h-14 sm:w-12 sm:h-12 object-cover cursor-pointer rounded-full' />
        </div>
    )
}

export default Header
