import logo from './logo.svg';
import './App.css';
import Three from "./three";
import D3 from "./d3";
import Navbar from "./navbar";

function App() {
  return (
    <div className="App">
        <Navbar />
      {/*<header className="App-header">*/}
      {/*  <img src={logo} className="App-logo" alt="logo" />*/}
      {/*  <p>*/}
      {/*    Edit <code>src/App.js</code> and save to reload.*/}
      {/*  </p>*/}
      {/*  <a*/}
      {/*    className="App-link"*/}
      {/*    href="https://reactjs.org"*/}
      {/*    target="_blank"*/}
      {/*    rel="noopener noreferrer"*/}
      {/*  >*/}
      {/*    Learn React*/}
      {/*  </a>*/}
      {/*</header>*/}

        <Three />
        {/*<D3 />*/}

    </div>
  );
}

export default App;
