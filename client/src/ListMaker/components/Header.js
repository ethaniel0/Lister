import ContentEditable from 'react-contenteditable';
import { useHistory } from "react-router-dom";
import { FaDoorOpen } from 'react-icons/fa';

const Header = ({ name, uid, listid, setName, topPic, profPic }) => {
    const history = useHistory();

    const uploadFile = (e) => {
        e.preventDefault();
        // console.log(e.target);
        let file = e.target.files[0];
        let formData = new FormData();
        formData.append('file', file);
        console.log(formData);
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.errors) {
                alert(data.errors);
            }
            else {
                console.log(data);
            }
        })
    };

    return (
        <div onClick={() => document.getElementById('fileUpload').click()} style={{backgroundSize: "cover", backgroundImage: `url(${topPic})`}} className="h-32 w-full flex justify-center relative">
            <input onChange={uploadFile} type="file" className="hidden" id="fileUpload" accept="image/png, image/jpeg" />
            <ContentEditable 
                   html={name}
                   onChange={(e) => setName(e.target.value)}
                   onClick={e => {e.preventDefault(); e.stopPropagation();}}
                   style={{fontFamily: 'Oregano'}}
                   className='bg-white absolute bottom-0 px-12 text-4xl pt-3 rounded-t-3xl outline-none' />
            <img 
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); history.push("/")}}
                src='/images/bilogo.png' 
                alt="Bringit" 
                className='absolute top-3 left-2 w-12 border-white border-2 rounded-full cursor-pointer' />
            <img 
                src={profPic}
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); history.push("/profile/" + uid)}}
                alt="Profile"
                className='absolute top-3 left-16 w-12 cursor-pointer rounded-full' />
            <FaDoorOpen onClick={(e) => {e.preventDefault(); e.stopPropagation(); history.push(`/list/${uid}/${listid}`)}} className='absolute right-4 top-4 text-2xl cursor-pointer gear' />
        </div>
    )
}

export default Header
