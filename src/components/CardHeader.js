import { FaMinusCircle } from 'react-icons/fa'

const CardHeader = ({ title, color, onEdit, onDelete }) => {
    return (
        <span>
            <input type='text' value={title} onChange={(e) => onEdit(e.target.value)} className={'outline-none text-'+color+'-500'} />
            <FaMinusCircle onClick={onDelete} style={{color: 'red', cursor: 'pointer'}} className="text-xl" />
        </span>
    )
}

export default CardHeader
