import CardHeader from './CardHeader';
import Item from './Item';
import { useState } from 'react';

const Card = ({ card, onEdit, onDelete }) => {
    const myCard = Object.assign({}, card);
    const [newInd, changeNewInd] = useState(-1);

    let tempId = () => Math.floor(Math.random() * 100000);

    const deleteMe = () => onDelete(myCard.id);
    
    const editHeader = (text => {
        myCard.name = text;
        onEdit(myCard);
    });
    const addItem = (ind) => {
        if (ind === undefined) ind = myCard.items.length;
        let item = {
            id: tempId(),
            text: "",
            checked: false
        };
        
        myCard.items.splice(ind+1, 0, item);
        changeNewInd(ind+1);
        onEdit(myCard);
    }
    const editItem = (id, text, checked) => {
        myCard.items = myCard.items.map(i => i.id === id ? {id: id, text: text, checked: checked} : i)
        onEdit(myCard);
    }
    const deleteItem = (id) => {
        myCard.items = myCard.items.filter(t => t.id !== id);
        onEdit(myCard);
    }
    const editColor = (color) => {
        myCard.color = color;
        onEdit(myCard);
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
