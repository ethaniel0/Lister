import { useHistory } from "react-router-dom";

const Header = () => {
    const history = useHistory();
    return (
        <div style={{backgroundImage: 'url(https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg)', backgroundSize: 'cover'}} className="h-32 w-full  flex justify-center relative">
            <div style={{fontFamily: 'Oregano'}} className='bg-white absolute bottom-0 px-12 text-4xl pt-3 rounded-t-3xl'>Duke University</div>
            <img
                onClick={() => history.push("/")}
                src='/images/bilogo.png'
                alt="Bring It main page"
                className='absolute top-3 left-2 w-12 filter border-white border-2 rounded-full cursor-pointer' />
            <img
                onClick={() => history.push("/profile")}
                src='/images/pfpic.png'
                alt="Profile page"
                className='absolute top-3 left-16 w-12 cursor-pointer' />
        </div>
    )
}

export default Header
