const Item = ({ color, id, last, text, checked, onEdit }) => {
    const colors = {
        red: "rgb(248, 113, 113)",
        blue: "rgb(96, 165, 250)",
        yellow: "rgb(251, 191, 36)",
        green: "rgb(52, 211, 153)",
        gray: "rgb(156, 163, 175)",
        indigo: "rgb(129, 140, 248)",
        purple: "rgb(167, 139, 250)",
        pink: "rgb(244, 114, 182)"
    };

    return (
        <li className={'bg-white' + (last ? '' : ' mb-4')}>
            <input type='checkbox' 
                   checked={checked}
                   name={id}
                   id={id}
                   onChange={(e) => onEdit(id, text, e.currentTarget.checked)}
                   className={'border-2 border-'+color+'-400 rounded-full'}
                   style={{backgroundColor: checked ? colors[color] : ""}} />
            <label for={id} type='text' className={'outline-none w-full border-0 ml-4 flex flex-wrap font-normal' + (checked ? ' line-through' : '')}>{text}</label>
        </li>
    )
}

export default Item
