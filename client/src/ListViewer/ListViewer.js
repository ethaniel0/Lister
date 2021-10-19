/* text-red-400 bg-red-400 bg-red-500 border-red-400 border-red-500 text-pink-400 bg-pink-400 bg-pink-500 border-pink-400 border-pink-500 text-yellow-400 bg-yellow-400 bg-yellow-500 border-yellow-400 border-yellow-500 text-green-400 bg-green-400 bg-green-500 border-green-400 border-green-500 text-blue-400 bg-blue-400 bg-blue-500 border-blue-400 border-blue-500 text-indigo-400 bg-indigo-400 bg-indigo-500 border-indigo-400 border-indigo-500 text-purple-400 bg-purple-400 bg-purple-500 border-purple-400 border-purple-500 text-gray-400 bg-gray-400 bg-gray-500 border-gray-400 border-gray-500 */
import './ListViewer.css';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from "react-router-dom";
import Header from './components/Header';
import Card from './components/Card';

function ListViewer() {
  const [sections, setSections] = useState([]);
  const [listName, setListName] = useState("");
  const [owner, setOwner] = useState(false);
  const [topPic, setTopPic] = useState("https://img.freepik.com/free-vector/gradient-dynamic-blue-lines-background_23-2148995756.jpg?size=626&ext=jpg");
  const [profPic, setProfPic] = useState('/images/pfpic.png');
  const history = useHistory();
  const { uid, listid } = useParams();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/list/' + listid).then(res => res.json()).then(json => {
        if (json.error) return history.push('/');
        if (isMounted){
          setListName(json.name);
          setOwner(json.owner);
          setProfPic(json.profPic);
          setTopPic(json.topPic);
          console.log(json.sections, json.checks);

          for (let skey in json.checks){
            for (let ikey in json.checks[skey]){
              json.sections[skey].items[ikey].checked = json.checks[skey][ikey];
            }
          }

          let secs = Object.keys(json.sections).map(k => json.sections[k]);
          secs.sort((a, b) => a.index - b.index);
          for (let o of secs) o.items = Object.values(o.items).sort((a, b) => a.index - b.index);
          for (let o of secs) for (let item of o.items) if (!('checked' in item)) item.checked = false;
          setSections(secs);


          
        }
    });

    return () => { isMounted = false };
}, [history, listid]);

  const editItem = (sid, tid, checked, sec) => {
    setSections(sections.map(s => s.id === sec.id ? sec : s));

    fetch(`/api/viewer/${listid}/checkItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({sid, tid, checked})
      });
  }

  return (
    <>
      <Header name={listName} uid={uid} listid={listid} owner={owner} topPic={topPic} profPic={profPic} />
      <div className='flex flex-wrap justify-around p-4 mt-8 font-sans'>
        {sections.map((sec) => (
          <Card key={sec.id} card={sec} onEdit={editItem} />
        ))}
      </div>
    </>
  );
}

export default ListViewer;
