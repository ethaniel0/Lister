import ItemMenu from "./ItemMenu";
import { useState } from 'react';
import { FaUserCheck } from 'react-icons/fa'

const List = ({ list, goToList, showItemMenu, setItemMenu, ind, uid, profile, deleteList, setPublic }) => {
    let { id, image, name } = list;
    let isPublic = list.public;

    const [img, setImg] = useState(image);

    const dots = (e) => {
        e.stopPropagation();
        console.log('clicked dots');
        setItemMenu(ind);
    }

    const uploadFile = (e) => {
        let file = e.target.files[0];
        let formData = new FormData();
        formData.append('file', file);
        console.log(formData);
        fetch(`/api/edit/${uid}/${id}/uploadCoverImage`, {
            method: 'POST',
            body: formData
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.errors) {
                alert(data.errors);
            }
            else {
                setImg(data.url);
                setItemMenu(-1);
            }
        })
    };

    return (
        <div key={id} onClick={() => goToList(id)} style={{backgroundImage: 'url(' + img +')', backgroundSize: 'cover', backgroundRepeat: 'no-repeat'}}  className="listDiv w-60 h-60 border-2 border-gray-200 border-dotted shadow-lg flex flex-col items-center justify-end">
            <div className='bg-white w-full p-1 bg-opacity-60 text-xl relative'>
                <span>{name}</span>
                <span onClick={dots} className="absolute right-0 bottom-0 p-2 font-bold cursor-pointer">...</span>
                {showItemMenu && <ItemMenu menu={true} id={id} isPublic={isPublic} uploadFile={uploadFile} deleteList={deleteList} setPublic={() => {setItemMenu(-1); setPublic(id, !isPublic)}} />}
                <span className={"absolute left-0 bottom-0 p-2 font-bold cursor-pointer text-green-800" + (profile.owner ? "" : " hidden")} >{isPublic && <FaUserCheck />}</span>
            </div>
        </div>
    )
}

export default List
