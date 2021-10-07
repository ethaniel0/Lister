/* text-red-400 bg-red-400 bg-red-500 border-red-400 border-red-500 text-pink-400 bg-pink-400 bg-pink-500 border-pink-400 border-pink-500 text-yellow-400 bg-yellow-400 bg-yellow-500 border-yellow-400 border-yellow-500 text-green-400 bg-green-400 bg-green-500 border-green-400 border-green-500 text-blue-400 bg-blue-400 bg-blue-500 border-blue-400 border-blue-500 text-indigo-400 bg-indigo-400 bg-indigo-500 border-indigo-400 border-indigo-500 text-purple-400 bg-purple-400 bg-purple-500 border-purple-400 border-purple-500 text-gray-400 bg-gray-400 bg-gray-500 border-gray-400 border-gray-500 */
import './ListMaker.css';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from "react-router-dom";
import Header from './components/Header';
import AddSection from './components/AddSection';
import Card from './components/Card';

function ListMaker() {
  const [sections, setSections] = useState([]);
  const [listName, setListName] = useState("Name");
  const history = useHistory();
  const { uid, listid } = useParams();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/list/' + listid).then(res => res.json()).then(json => {
        if (json.error) return history.push('/');
        console.log(json);
        if (json.owner === false) return history.push('/');
        if (isMounted){
          setListName(json.name);
          let secs = Object.keys(json.sections).map(k => json.sections[k]);
          secs.sort((a, b) => a.index - b.index);
          for (let o of secs){
            let items = Object.values(o.items);
            items.sort((a, b) => a.index - b.index);
            o.items = items;
          }
          console.log(secs);
          setSections(secs);
        }
    });
    return () => { isMounted = false };
}, [])

  const addSection = () => {
    let randColor = ['red', 'blue', 'yellow', 'green', 'gray', 'indigo', 'purple', 'pink'][Math.floor(Math.random() * 8)];
    fetch(`/api/edit/${uid}/${listid}/addSection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({color: randColor})
    }).then(res => res.json()).then(json => {
      if (json.id){
        setSections([...sections, {
          id: json.id,
          name: "New Section",
          color: randColor,
          items: [{
            id: json.tid,
            text: "",
            checked: false
          }]
        }]);
      }
    })
  }
  // edit color, name, or index
  const editSection = (sid, field, value, sec) => {
    let old = sections;
    setSections(sections.map(s => s.id === sec.id ? sec : s));
    if (field === 'item')
      return 
    fetch(`/api/edit/${uid}/${listid}/editSection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({sid, field, value})
      }).then(res => res.json()).then(json => {
        if (!json.success){
          setSections(old);
        }
      })
  }
  const deleteSection = (id) => {
    let old = sections;
    setSections(sections.filter(s => s.id !== id));
    fetch(`/api/edit/${uid}/${listid}/deleteSection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({sid: id})
      }).then(res => res.json()).then(json => {
        if (!json.success){
          setSections(old);
        }
      })
  }

  const editItem = (sid, tid, field, value, sec) => {
    let old = sections;
    setSections(sections.map(s => s.id === sec.id ? sec : s));
    fetch(`/api/edit/${uid}/${listid}/editItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({sid, tid, field, value})
      }).then(res => res.json()).then(json => {
        if (!json.success){
          setSections(old);
        }
      })
  }

  return (
    <>
      <Header name={listName} setName={setListName} />
      <div className='flex flex-wrap justify-around p-4 mt-8 font-sans'>
        {sections.map((sec) => (
          <Card key={sec.id} card={sec} onEdit={editSection} onDelete={deleteSection} />
        ))}
        <AddSection onAdd={addSection} />
      </div>
    </>
  );
}

export default ListMaker;
