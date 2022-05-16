import ContentEditable from 'react-contenteditable';
import { useHistory } from "react-router-dom";
import { FaDoorOpen } from 'react-icons/fa';

const Header = ({ name, uid, listid, setName, topPic, profPic, setTopPic }) => {
    const history = useHistory();

    const uploadFile = (e) => {
        e.preventDefault();
        // console.log(e.target);
        let file = e.target.files[0];
        let formData = new FormData();
        formData.append('file', file);
        console.log(formData);
        fetch(`/api/edit/${uid}/${listid}/uploadTopImage`, {
            method: 'POST',
            body: formData
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.errors) {
                alert(data.errors);
            }
            else {
                setTopPic(data.url);
            }
        })
    };

    function filter(name){
        name = name.replace("&nbsp;", ' ');
        console.log(name.length);
        return name.length > 50 || name.includes('<') || name.includes('>') || name.includes('&');
    }
    

    return (
        <div onClick={() => document.getElementById('fileUpload').click()} style={{backgroundSize: "cover", backgroundImage: `url(${topPic})`}} className="h-32 w-full flex justify-center relative">
            <input onChange={uploadFile} type="file" className="hidden" id="fileUpload" accept="image/png, image/jpeg" />
            <ContentEditable 
                   html={name}
                   onChange={(e) => setName(e.target.value, e)}
                   onKeyPress={(e) => {if (filter(e.target.innerHTML)) e.preventDefault()}}
                   onClick={e => {e.stopPropagation();}}
                   style={{fontFamily: 'Oregano'}}
                   className='list-title bg-white absolute top-[calc(100%_-_3rem)] px-12 text-4xl pt-3 rounded-t-3xl outline-none' />
            <img 
                onClick={(e) => {e.stopPropagation(); history.push("/")}}
                src='/images/bilogo.png' 
                alt="Bringit" 
                className='absolute top-3 left-2 w-12 h-12 object-cover border-white border-2 rounded-full cursor-pointer' />
            <img 
                src={profPic}
                onClick={(e) => {e.stopPropagation(); history.push("/profile/" + uid)}}
                alt="Profile"
                className='absolute top-3 left-16 w-12 h-12 object-cover cursor-pointer rounded-full' />
            <FaDoorOpen onClick={(e) => {e.stopPropagation(); history.push(`/list/${uid}/${listid}`)}} className='absolute right-4 top-4 text-2xl cursor-pointer gear bg-white box-content p-1 rounded-lg border-black border-2' />
        </div>
    )
}

export default Header
