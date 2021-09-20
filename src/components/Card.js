import CardHeader from './CardHeader';
import Item from './Item';

const Card = ({ card, onEdit, onDelete }) => {
    const myCard = Object.assign({}, card);

    let tempId = () => Math.floor(Math.random() * 100000);

    const deleteMe = () => onDelete(myCard.id);
    
    const editHeader = (text => {
        myCard.name = text;
        onEdit(myCard);
    });
    const addItem = () => {
        let item = {
            id: tempId(),
            text: "",
            checked: false
        };
        myCard.items.push(item);
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


    
    return (
        <div className={`pack-list-card text-{card.color}-500 {card.color}`} >
            <CardHeader title={myCard.name} color={myCard.color} onEdit={editHeader} onDelete={deleteMe} />
            <div>
                <ul className='pack-list blue'>
                    {card.items.map(item => (
                        <Item key={item.id} id={item.id} color={myCard.color} text={item.text} checked={item.checked} onEdit={editItem} onDelete={deleteItem} />
                    ))}
                    <li onClick={addItem} className={'add bg-white hover:bg-'+card.color+'-400 transition-colors cursor-pointer'}>Add Item</li>
                </ul>
            </div>
        </div>
    )
}

export default Card
