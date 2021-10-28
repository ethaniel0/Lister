const ItemMenu = ({ menu }) => {
    return (
        <div style={{top: '2.5em'}} className={'absolute flex flex-col border-black border-2 rounded-lg text-lg bg-white right-0' + (menu ? '' : ' hidden')}>
            <span className='text-center py-2  px-6 hover:bg-gray-200 rounded-t-md cursor-default'>Change Picture</span>
            <hr />
            <span className='text-center py-2 px-6 hover:bg-gray-200 cursor-default'>Make Public</span>
            <hr />
            <span className='text-red-500 text-center py-2 px-6 hover:bg-gray-200 rounded-b-md cursor-default'>Delete</span>
        </div>
    )
}

export default ItemMenu
