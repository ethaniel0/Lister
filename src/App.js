// import './index.css';
import './App.css';
import { useState } from 'react';
import Header from './components/Header';
import AddSection from './components/AddSection';
import Card from './components/Card';


function App() {
  const [sections, setSections] = useState([]);

  let tempId = () => Math.floor(Math.random() * 100000);

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
      <Header />
      <div className='flex flex-wrap justify-around p-4'>
        {sections.map((sec) => (
          <Card key={sec.id} card={sec} onEdit={editSection} onDelete={deleteSection} />
        ))}
        <AddSection onAdd={addSection} />
      </div>
    </>
  );
}

export default App;
