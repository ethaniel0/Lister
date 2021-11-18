import './App.css';
import StartPage from './StartPage/StartPage';
import Profile from './Profile/Profile';
import ListViewer from './ListViewer/ListViewer';
import ListMaker from './ListMaker/ListMaker';
import Settings from './Settings/Settings';
import Browse from './Browse/Browse';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

function App() {

  return (
    <Router>
      <Switch>
        <Route exact path='/' component={StartPage}></Route>
        <Route exact path='/search/:query' component={Browse} />
        <Route exact path='/list/:uid/:listid' component={ListViewer} />
        <Route exact path='/makelist/:uid/:listid' component={ListMaker} />
        <Route exact path='/makelist/untitled' component={ListMaker} />
        <Route exact path='/profile/:uid' component={Profile}></Route>
        <Route exact path='/profile/:uid/Settings' component={Settings}></Route>
      </Switch>
    </Router>
    
  );
}

export default App;
