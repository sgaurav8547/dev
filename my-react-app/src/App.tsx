import "./App.css";
import AppProvider from "./AppProvider";
import Home from "./Home";

function App() {
  return (
    <>
      <AppProvider>
        <div className="App">
          <Home />
        </div>
      </AppProvider>
    </>
  );
}

export default App;
