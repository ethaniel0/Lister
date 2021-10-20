/* text-red-400 bg-red-400 bg-red-500 border-red-400 border-red-500 text-pink-400 bg-pink-400 bg-pink-500 border-pink-400 border-pink-500 text-yellow-400 bg-yellow-400 bg-yellow-500 border-yellow-400 border-yellow-500 text-green-400 bg-green-400 bg-green-500 border-green-400 border-green-500 text-blue-400 bg-blue-400 bg-blue-500 border-blue-400 border-blue-500 text-indigo-400 bg-indigo-400 bg-indigo-500 border-indigo-400 border-indigo-500 text-purple-400 bg-purple-400 bg-purple-500 border-purple-400 border-purple-500 text-gray-400 bg-gray-400 bg-gray-500 border-gray-400 border-gray-500 */
import './ListMaker.css';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from "react-router-dom";
import Header from './components/Header';
import AddSection from './components/AddSection';
import Card from './components/Card';

function ListMaker() {
  const [sections, setSections] = useState([]);
  const [listName, setListName] = useState("");
  const [topPic, setTopPic] = useState("https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg");
  const [profPic, setProfPic] = useState('/images/pfpic.png');
  const history = useHistory();
  const { uid, listid } = useParams();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/list/' + listid).then(res => res.json()).then(json => {
        if (json.error) return history.push('/');
        if (json.owner === false) return history.push('/');
        if (isMounted){
          setListName(json.name);
          setProfPic(json.profPic);
          setTopPic(json.topPic);
          let secs = Object.keys(json.sections).map(k => json.sections[k]);
          secs.sort((a, b) => a.index - b.index);
          for (let o of secs){
            let items = Object.values(o.items);
            items.sort((a, b) => a.index - b.index);
            o.items = items;
          }
          setSections(secs);
        }
    });
    return () => { isMounted = false };
}, [history, listid]);

  const editName = (name) => {
    setListName(name);
    fetch(`/api/edit/${uid}/${listid}/editListName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
  }

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

  const addItem = async (sid, ind, sec) => {
    let old = sections;
    if (ind === undefined) ind = sec.items.length-1;
    let item = {
      id: "-", // json.success is the item id
      text: "",
      checked: false,
      index: sec.items.length
    };
    sec.items.splice(ind+1, 0, item);
    setSections(sections.map(s => s.id === sec.id ? sec : s));
    fetch(`/api/edit/${uid}/${listid}/addItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sid, ind: ind+1 })
      }).then(res => res.json()).then(json => {
        if (!json.success){ // if it didn't work, revert
          return setSections(old);
        }
        sec.items[ind+1].id = json.success;
        setSections(sections.map(s => s.id === sec.id ? sec : s));
      })
  }

  const editItem = (sid, tid, value, sec) => {
    let old = sections;
    setSections(sections.map(s => s.id === sec.id ? sec : s));
    fetch(`/api/edit/${uid}/${listid}/editItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({sid, tid, value})
      }).then(res => res.json()).then(json => {
        if (!json.success){
          setSections(old);
        }
      })
  }

  const deleteItem = (sid, tid, sec) => {
    let old = sections;
    setSections(sections.map(s => s.id === sec.id ? sec : s));
    fetch(`/api/edit/${uid}/${listid}/deleteItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({sid, tid})
      }).then(res => res.json()).then(json => {
        if (!json.success){
          setSections(old);
        }
      })
  }

  return (
    <>
      <Header name={listName} setName={editName} profPic={profPic} topPic={topPic} uid={uid} listid={listid} />
      <div className='flex flex-wrap justify-around p-4 mt-8 font-sans'>
        {sections.map((sec) => (
          <Card key={sec.id} card={sec} onEdit={editSection} onAdd={addItem} onItemEdit={editItem} onDeleteItem={deleteItem} onDelete={deleteSection} />
        ))}
        <AddSection onAdd={addSection} />
      </div>
    </>
  );
}

export default ListMaker;
