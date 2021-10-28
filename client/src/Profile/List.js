import ItemMenu from "./ItemMenu";

const List = ({ id, image, name, goToList }) => {
    const dots = (e) => {
        e.stopPropagation();
        console.log('clicked dots');
    }
    return (
        <div key={id} onClick={() => goToList(id)} style={{backgroundImage: 'url(' + image +')', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}  className="listDiv w-60 h-60 border-2 border-gray-200 border-dotted shadow-lg flex flex-col items-center justify-end">
            <div className='bg-white w-full p-1 bg-opacity-60 text-xl relative'>
                <span>{name}</span>
                <span onClick={dots} className="absolute right-0 bottom-0 p-2 font-bold cursor-pointer">...</span>
                <ItemMenu menu={true} />
            </div>
        </div>
    )
}

export default List
