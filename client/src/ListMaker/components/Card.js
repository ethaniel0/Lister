import CardHeader from './CardHeader';
import Item from './Item';
import { useState } from 'react';

const Card = ({ card, onEdit, onAdd, onItemEdit, onDeleteItem, onDelete }) => {
    const myCard = Object.assign({}, card);
    const [newInd, changeNewInd] = useState(-1);

    const deleteMe = () => onDelete(myCard.id);
    
    const editHeader = (text => {
        myCard.name = text;
        onEdit(myCard.id, 'name', text, myCard);
    });
    const addItem = (ind) => {
        changeNewInd(ind+1);
        onAdd(myCard.id, ind, myCard);
    }
    const editItem = (id, text, checked) => {
        myCard.items = myCard.items.map(i => i.id === id ? {id: id, text: text, checked: checked} : i);
        onItemEdit(myCard.id, id, text, myCard);
    }
    const deleteItem = (id) => {
        myCard.items = myCard.items.filter(t => t.id !== id);
        onDeleteItem(myCard.id, id, myCard);
    }
    const editColor = (color) => {
        myCard.color = color;
        onEdit(myCard.id, 'color', color, myCard);
    }
    
    return (
        <div className='pack-list-card mb-8' >
            <CardHeader title={myCard.name} color={myCard.color} onEdit={editHeader} onDelete={deleteMe} onColorChange={editColor} />
            <div>
                <ul className='pack-list'>
                    {card.items.map((item, i) => (
                        <Item key={item.id} focus={i === newInd} id={item.id} color={myCard.color} text={item.text} checked={item.checked} onEdit={editItem} onDelete={deleteItem} addItem={() => addItem(i)} />
                    ))}
                    <li onClick={() => addItem()} className={'add bg-white hover:bg-'+card.color+'-400 transition-colors cursor-pointer mb-0 font-medium'}>Add Item</li>
                </ul>
            </div>
        </div>
    )
}

export default Card
