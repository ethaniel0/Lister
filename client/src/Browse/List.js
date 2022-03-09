
const List = ({ uid, listid, img, name}) => {

    return (
        <div onClick={() => window.location.href=`/list/${uid}/${listid}`} style={{backgroundImage: 'url(' + img +')', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'}}  className="listDiv inline-flex  w-60 h-60 flex-col items-center justify-end">
            <div className='bg-white w-full p-1 bg-opacity-60 text-xl relative'>
                <span>{name}</span>
            </div>
        </div>
    )
}

export default List
