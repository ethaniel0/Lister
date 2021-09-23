import './App.css';
import ListMaker from './ListMaker/ListMaker';
import StartPage from './StartPage/StartPage';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'


function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={StartPage} />
        <Route exact path='/makeList' component={ListMaker} />
      </Switch>
    </Router>
    
  );
}

export default App;
