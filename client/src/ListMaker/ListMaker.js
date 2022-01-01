/* text-red-400 bg-red-400 bg-red-500 border-red-400 border-red-500 text-pink-400 bg-pink-400 bg-pink-500 border-pink-400 border-pink-500 text-yellow-400 bg-yellow-400 bg-yellow-500 border-yellow-400 border-yellow-500 text-green-400 bg-green-400 bg-green-500 border-green-400 border-green-500 text-blue-400 bg-blue-400 bg-blue-500 border-blue-400 border-blue-500 text-indigo-400 bg-indigo-400 bg-indigo-500 border-indigo-400 border-indigo-500 text-purple-400 bg-purple-400 bg-purple-500 border-purple-400 border-purple-500 text-gray-400 bg-gray-400 bg-gray-500 border-gray-400 border-gray-500 */
import './ListMaker.css';
import { useState, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa'
import { useHistory, useParams } from "react-router-dom";
import Header from './components/Header';
import AddSection from './components/AddSection';
import Card from './components/Card';
import ContentEditable from 'react-contenteditable';

function ListMaker() {
  const [sections, setSections] = useState([]);
  const [listName, setListName] = useState("");
  const [topPic, setTopPic] = useState("https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg");
  const [profPic, setProfPic] = useState('/images/pfpic.png');
  const [tagtyping, setTagtyping] = useState('');
  const [newTag, makeNewTag] = useState(false);
  const [tags, setTags] = useState([]);
  const history = useHistory();
  const { uid, listid } = useParams();
  const trial = uid === undefined;

  useEffect(() => {
    if (trial){
      setListName("New List");
      return;
    }
    let isMounted = true;
    fetch('/api/list/' + listid).then(res => res.json()).then(json => {
        if (json.error) return history.push('/');
        if (json.owner === false) return history.push('/');
        if (isMounted){
          setListName(json.name);
          setProfPic(json.profPic);
          setTopPic(json.topPic);
          setTags(json.tags || []);
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
}, [history, listid, trial]);

  const editName = (name) => {
    setListName(name);
    if (trial) return;
    fetch(`/api/edit/${uid}/${listid}/editListName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
  }

  const randomHex = (size) => {
    let alph = 'abcdef1234567890';
    let ret = '';
    for (let i = 0; i < size; i++) ret += alph.charAt(Math.floor(Math.random()*alph.length));
    return ret;
  }

  const addSection = () => {
    let randColor = ['red', 'blue', 'yellow', 'green', 'gray', 'indigo', 'purple', 'pink'][Math.floor(Math.random() * 8)];
    if (trial){
      let sid = randomHex(8);
      let tid = randomHex(8);
      setSections([...sections, {
        id: sid,
        name: "New Section",
        color: randColor,
        items: [{
          id: tid,
          text: "",
          checked: false
        }]
      }]);
      return;
    }

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
    if (trial) return;
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
    if (trial) return;
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
    if (trial){
      item.id = randomHex(8);
      return setSections(sections.map(s => s.id === sec.id ? sec : s));
    }
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
    if (trial) return;
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
    if (trial) return;
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

  const onRefChange = useCallback(node => {
    if (node !== null) node.el.current.focus();
  }, []); // adjust deps

  const addTag = (str) => {
    let arr = [...tags, str];
    if (!tags.includes(str)) setTags(arr);
    fetch(`/api/edit/${uid}/${listid}/addTag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tags: arr })
    });

  }

  const removeTag = (ind) => {
    let arr = tags.filter((e, i) => i !== ind);
    setTags(arr);
    fetch(`/api/edit/${uid}/${listid}/addTag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tags: arr })
    });
  }

  const tagType = (e) => {
    if (e.target.value.includes('<')){
      addTag(tagtyping);
      resetNewTag();
    }
    else setTagtyping(e.target.value);
  }

  const resetNewTag = () => {
    makeNewTag(false);
    setTagtyping('');
  }

  return (
    <>
      <Header name={listName} setName={editName} setTopPic={setTopPic} profPic={profPic} topPic={topPic} uid={uid} listid={listid} />
      <div className='text-center mt-4'>
        <h1 className='text-2xl font-bold mb-4'>Tags</h1>
        <div className='text-center'>
          {
            tags.map((t, i) => (
              <span key={i} className={`inline-flex items-center py-1 px-2 rounded-lg text-sm mx-2 bg-red-200`} style={{border: '2px solid black'}}>
                <span>{t}</span>
                <FaTimes className='ml-2 cursor-pointer text-xs' onClick={() => removeTag(i)}>x</FaTimes>
              </span>
            ))
          }
          {
            newTag ? <span className={`inline-flex items-center py-1 px-2 rounded-lg text-sm mx-2 bg-red-200`} style={{border: '2px dotted black'}}>
              <ContentEditable 
                   html={tagtyping}
                   onChange={tagType}
                   onClick={e => {e.stopPropagation();}}
                   className='outline-none'
                   placeholder='tag'
                   ref={onRefChange}
                  />
              <FaTimes className='ml-2 cursor-pointer text-xs' onClick={resetNewTag}>x</FaTimes>
            </span>
            : <span className='cursor-pointer' onClick={() => makeNewTag(true)}>+ Add Tag</span>
          }
        </div>
      </div>
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
