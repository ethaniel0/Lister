const ItemMenu = ({ menu, id, isPublic, uploadFile, deleteList, setPublic }) => {
    return (
        <div onClick={(e) => e.stopPropagation()} style={{top: '2.5em'}} className={'absolute flex flex-col border-black border-2 rounded-lg text-lg bg-white right-0' + (menu ? '' : ' hidden')}>
            <input type="file" id={'file-' + id} name={'file-' + id} onChange={uploadFile} className="hidden" accept="image/png, image/jpeg" />
            <label htmlFor={'file-' + id} className='text-center py-2  px-6 hover:bg-gray-200 rounded-t-md cursor-default'>Change Picture</label>
            <hr />
            <span onClick={setPublic} className='text-center py-2 px-6 hover:bg-gray-200 cursor-default'>{isPublic ? "Make Private" : "Make Public"}</span>
            <hr />
            <span onClick={deleteList} className='text-red-500 text-center py-2 px-6 hover:bg-gray-200 rounded-b-md cursor-default'>Delete</span>
        </div>
    )
}

export default ItemMenu
