
const AddSection = ({ onAdd }) => {
    return (
        <div onClick={onAdd} className='rounded-xl h-20 flex items-center justify-center bg-gray-200 hover:bg-blue-500 transition-colors duration-300 cursor-pointer' style={{width: "40vw"}}>
            <span className='bg-white rounded-md h-14 flex justify-center items-center text-2xl ' style={{width: "calc(100% - 1.5rem)"}}>New Section</span>
        </div>
    )
}

export default AddSection
