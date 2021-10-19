import CardHeader from './CardHeader';
import Item from './Item';

const Card = ({ card, onEdit }) => {
    const myCard = Object.assign({}, card);
    const editItem = (id, text, checked) => {
        myCard.items = myCard.items.map(i => i.id === id ? {id: id, text: text, checked: checked} : i)
        onEdit(myCard.id, id, checked, myCard);
    }
    
    return (
        <div className='pack-list-card mb-8' >
            <CardHeader title={myCard.name} color={myCard.color} />
            <div>
                <ul className='pack-list'>
                    {card.items.map((item, i) => (
                        <Item key={item.id} last={i === card.items.length - 1} id={item.id} color={myCard.color} text={item.text} checked={item.checked} onEdit={editItem} />
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Card
