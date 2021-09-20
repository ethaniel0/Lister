import { FaMinusCircle } from 'react-icons/fa'

const Item = ({ color, id, text, checked, onEdit, onDelete }) => {
    const colors = {
        red: "rgb(248, 113, 113)",
        blue: "rgb(96, 165, 250)",
        yellow: "rgb(251, 191, 36)",
        green: "rgb(52, 211, 153)",
        gray: "rgb(156, 163, 175)",
        indigo: "rgb(129, 140, 248)",
        purple: "rgb(167, 139, 250)",
        pink: "rgb(244, 114, 182)"
    }
    return (
        <li className='bg-white'>
            <input type='checkbox' 
                   checked={checked}
                   onChange={(e) => onEdit(id, text, e.currentTarget.checked)}
                   className={'border-2 border-'+color+'-400 '}
                   style={{backgroundColor: checked ? colors[color] : ""}} />

            <input type='text'
                   value={text} 
                   onChange={(e) => onEdit(id, e.target.value, checked)} 
                   className='outline-none w-full border-0' />

            <FaMinusCircle className="text-red-500 cursor-pointer" onClick={() => onDelete(id)} />
        </li>
    )
}

export default Item
