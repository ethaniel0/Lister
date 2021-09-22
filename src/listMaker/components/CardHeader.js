import { FaMinusCircle } from 'react-icons/fa'
import { useState } from 'react';

const CardHeader = ({ title, color, onEdit, onDelete, onColorChange }) => {

    const [usePicker, togglePicker] = useState(false);
    
    const colors = ['red', 'pink', 'yellow', 'green', 'blue', 'indigo', 'purple', 'gray'];

    const changeColors = (col) => {
        togglePicker(false);
        onColorChange(col);
    }

    return (
        <span className="flex justify-between items-center w-full text-2xl font-bold text-left mb-2">
            <div className="relative">
                <div onClick={() => togglePicker(!usePicker)}
                    className={"border-"+color+"-500 bg-"+color+"-500 border-2 box-border h-3 w-3 p-2 rounded-full mr-4"}>
                </div>
                <div 
                    className="absolute flex flex-row flex-wrap justify-around items-center border-2 border-black rounded-lg mt-3 bg-gray-50 p-1 shadow-xl bg-opacity-80"
                    style={{display: usePicker ? "flex" : "none", width: "10rem", height: "5rem"}}>
                    
                    {colors.map(col => (
                        <div key={col} 
                            onClick={() => changeColors(col)}
                            className={"border-"+col+"-500 bg-"+col+"-500 border-2 box-border h-3 w-3 p-2 rounded-full mx-2"}>
                        </div>
                    ))}
                    
                </div>
                
            </div>
            <input type='text' value={title} onChange={(e) => onEdit(e.target.value)} className={'outline-none text-'+color+'-500'} />   
            <FaMinusCircle onClick={onDelete} style={{color: 'red', cursor: 'pointer'}} className="text-xl" />
        </span>
    )
}

export default CardHeader
