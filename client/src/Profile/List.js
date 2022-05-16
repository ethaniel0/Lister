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
        <div key={id} onClick={() => goToList(id)} style={{backgroundImage: 'url(' + img +')', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'}}  className="listDiv m-1 mb-4 w-60 h-60 flex flex-col items-center justify-end relative">
            <div className='bg-white w-full p-1 bg-opacity-60 text-xl relative'>
                <span>{name}</span>
            </div>
            <div class='absolute top-0 left-0 w-full'>
                <div className="absolute right-2 top-2 p-2 font-bold cursor-pointer bg-white rounded-md w-8 h-8 flex justify-center items-center">
                    <span onClick={dots}>•••</span>
                </div>
                
                {showItemMenu && <ItemMenu menu={true} id={id} isPublic={isPublic} uploadFile={uploadFile} deleteList={deleteList} setPublic={() => {setItemMenu(-1); setPublic(id, !isPublic)}} />}
                <div className={"absolute left-2 top-2 p-2 font-bold cursor-pointer rounded-md w-8 h-8 flex justify-center items-center" + (isPublic && ' bg-white')} >
                    <span className={"absolute left-0 top-0 p-2 font-bold cursor-pointer text-green-800" + (profile.owner ? "" : " hidden")} >{isPublic && <FaUserCheck />}</span>
                </div>
                
            </div>
        </div>
    )
}

export default List
