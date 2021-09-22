const Card = ({ card, onEdit }) => {
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
        <div className={'pack-list-card mb-8'} style={{transform: 'rotate(3deg)', minWidth: '80%'}} >
            <span className="flex justify-between items-center w-full text-2xl text-left mb-2">
                <span type='text' className={'text-'+card.color+'-500'}>{card.name}</span>  
            </span>
            <div>
                <ul className='pack-list'>
                    {card.items.map((item, i) => (
                        <li key={item.id} className='bg-white mb-4'>
                            <input type='checkbox' 
                                checked={item.checked}
                                onChange={(e) => onEdit(i, e.currentTarget.checked)}
                                className={'border-2 border-'+card.color+'-400 rounded-full'}
                                style={{backgroundColor: item.checked ? colors[card.color] : ""}} />
                        
                            <span type='text' className='w-full border-0 ml-4 flex flex-wrap'>{item.text}</span>
                        </li>
                        // <Item key={item.id} focus={i === newInd} id={item.id} color={myCard.color} text={item.text} checked={item.checked} onEdit={editItem} onDelete={deleteItem} addItem={() => addItem(i)} />
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Card
