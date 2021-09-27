// import './index.css';
import './ListMaker.css';
import { useState } from 'react';
import Header from './components/Header';
import AddSection from './components/AddSection';
import Card from './components/Card';

function ListMaker() {
  const [sections, setSections] = useState([]);
  const [listName, setListName] = useState("Name");

  let tempId = () => Math.floor(Math.random() * 100000);

  /* text-red-400 bg-red-400 bg-red-500 border-red-400 border-red-500 text-pink-400 bg-pink-400 bg-pink-500 border-pink-400 border-pink-500 text-yellow-400 bg-yellow-400 bg-yellow-500 border-yellow-400 border-yellow-500 text-green-400 bg-green-400 bg-green-500 border-green-400 border-green-500 text-blue-400 bg-blue-400 bg-blue-500 border-blue-400 border-blue-500 text-indigo-400 bg-indigo-400 bg-indigo-500 border-indigo-400 border-indigo-500 text-purple-400 bg-purple-400 bg-purple-500 border-purple-400 border-purple-500 text-gray-400 bg-gray-400 bg-gray-500 border-gray-400 border-gray-500 */

  const addSection = () => {
    let sid = tempId(); // get section id
    let tid = tempId(); // get text id
    let randColor = ['red', 'blue', 'yellow', 'green', 'gray', 'indigo', 'purple', 'pink'][Math.floor(Math.random() * 8)];
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
  }
  const editSection = (sec) => {
    setSections(sections.map(s => s.id === sec.id ? sec : s));
  }
  const deleteSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
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
