import './App.css';
import ListMaker from './listMaker/ListMaker';
import StartPage from './components/StartPage';
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
