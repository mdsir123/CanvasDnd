

import { useContext, useState } from "react";
import Canvas from "./Canvas";
import { ElementStore } from "./utils/ElementsController";

const Home = () => {
  const { elements,setElements } = useContext(ElementStore);
  const [exportCode, setExportCode] = useState(false)

  const popDraggedElement = (elements, draggedId) => {
    for (let el of elements) {
      if (el.id === draggedId) {
        return { 
          updated: elements.filter(el => el.id !== draggedId), 
          extracted: el 
        };
      }
      if (el.children && el.children.length > 0) {
        const result = popDraggedElement(el.children, draggedId);
        if (result) {
          return {
            updated: elements.map(e => {
              if (e.id === el.id) {
                return {
                  ...e,
                  children: result.updated
                };
              }
              return e;
            }),
            extracted: result.extracted
          };
        }
      }
    }
    return null;
  };

  const onCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData("elementId");
    const result = popDraggedElement(elements, draggedId);

    if (result) {
      setElements([...result.updated, result.extracted]);
    }
  };

  const renderStructure = (elements, depth = 0) => {
    return elements.map(el => (
      <div key={el.id} style={{ marginLeft: depth * 20 }}>
        <code>{`<${el.type} ${el.props.className || ''}>${el.props.text || ''}`}</code>
        {el.children && el.children.length > 0 && renderStructure(el.children, depth + 1)}
        <code>{`</${el.type}>`}</code>
      </div>
    ));
  };

  return (
    <div className="p-6">
        
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
          <div className="flex-col gap-4">
            <div
              className="min-h-96 border-3 rounded-lg p-4 bg-base-200"
              onDrop={onCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex flex-wrap gap-4">
                {elements.map((el) => (
                  <Canvas element={el} key={el.id} />
                ))}
              </div>
              <button className="btn btn-primary" onClick={()=>setExportCode(!exportCode)}>Export Code</button>
            </div>
          
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Generated HTML Structure</h3>
            <div className="border-1 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
              {exportCode ? renderStructure(elements) : ''}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Home;

