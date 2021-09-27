import './App.css';
import ListMaker from './ListMaker/ListMaker';
import StartPage from './StartPage/StartPage';
import Profile from './Profile/Profile';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { useState } from 'react'


function App() {
  const [lists, updateLists] = useState([
    {
      id: 1,
      name: "something",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Duke_Athletics_logo.svg/1200px-Duke_Athletics_logo.svg.png"
    }
  ])

  const addList = (newList) => {
    updateLists([...lists, newList])
  }

  return (
    <Router>
      <Switch>
        <Route exact path='/' component={StartPage}></Route>
        <Route exact path='/makelist' component={ListMaker} />
        <Route exact path='/profile'><Profile lists={lists} makeList={addList} /></Route>
      </Switch>
    </Router>
    
  );
}

export default App;
