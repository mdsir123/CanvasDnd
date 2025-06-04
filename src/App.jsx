import Home from "./Home";
import ElementController from "./utils/ElementsController";

console.log("This is test app")

const App = () => {
  return (
    <ElementController>
      <Home></Home>
    </ElementController>
  )
};

export default App;
