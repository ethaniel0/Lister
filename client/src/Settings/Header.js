import { useHistory } from "react-router-dom";

const Header = ({ uid, topPic, profPic, uploadFile }) => {
    const history = useHistory();
    return (
        <div onClick={(e) => {e.stopPropagation(); document.getElementById('fileUpload').click()}} style={{backgroundImage: ('url(' + topPic + ')'), backgroundSize: 'cover', backgroundPosition: 'center'}} className="h-32 w-full  flex justify-center relative">
            <input onChange={uploadFile} type="file" className="hidden" id="fileUpload" accept="image/png, image/jpeg" />
            <img
                onClick={(e) => {e.stopPropagation(); history.push("/")}}
                src='/images/bilogo.png'
                alt="Bring It main page"
                className='absolute top-3 left-2 w-12 border-white border-2 rounded-full cursor-pointer' />
            <img
                onClick={(e) => {e.stopPropagation(); history.push("/profile/" + uid)}}
                src={profPic}
                alt="Profile page"
                className='absolute top-3 left-16 w-12 cursor-pointer rounded-full' />
            <span onClick={(e) => {e.stopPropagation(); document.getElementById('fileUpload').click()}} style={{top: 'calc(100% + 0.5rem)'}} className='absolute left-4 text-blue-700 cursor-pointer'>Change Top Image</span>
        </div>
    )
}

Header.defaultProps = {
    user: null
}

export default Header
