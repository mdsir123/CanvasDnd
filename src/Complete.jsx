import React, { useContext, useState } from "react";

// Updated components that handle drag events properly
const Container = ({ children, className, tag = 'div', onDragStart, onDragOver, onDragLeave, onDrop, style, draggable, ...props }) => {
  const Tag = tag;
  return (
    <Tag 
      className={className} 
      style={style}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...props}
    >
      {children}
    </Tag>
  );
};

const Text = ({ tag = 'p', text, className, onDragStart, onDragOver, onDragLeave, onDrop, style, draggable, ...props }) => {
  const Tag = tag;
  return (
    <Tag 
      className={className} 
      contentEditable={true}
      style={style}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...props}
    >
      {text}
    </Tag>
  );
};

// Mock ElementStore context
const ElementStore = React.createContext(null);

const Canvas = ({ element }) => {
  const [dragOver, setDragOver] = useState(false);
  const { elements, setElements } = useContext(ElementStore);

  const isValidDrop = (element) => {
    return element.isContainer;
  };

  const findDraggedElement = (elements, draggedId) => {
    for (let el of elements) {
      if (el.id === draggedId) return el;

      if (el.children && el.children.length > 0) {
        let found = findDraggedElement(el.children, draggedId);
        if (found) return found;
      }
    }
    return null;
  };

  const isDescendant = (draggedElement, targetId) => {
    if (!draggedElement || !draggedElement.children || draggedElement.children.length === 0) {
      return false;
    }

    for (let child of draggedElement.children) {
      if (child.id === targetId || isDescendant(child, targetId)) {
        return true;
      }
    }
    return false;
  };

  const updateElementsById = (elements, targetId, updateFn) => {
    return elements.map((el) => {
      if (el.id === targetId) {
        return updateFn(el);
      }

      if (el.children && el.children.length > 0) {
        return {
          ...el,
          children: updateElementsById(el.children, targetId, updateFn)
        };
      }

      return el;
    });
  };

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

  const onElementDragStart = (e) => {
    e.stopPropagation();
    console.log("Drag Start for element:", element.id, element.type);
    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.effectAllowed = "move";
    // what is effectAllowed?????
  };

  const onElementDragOver = (e) => {
    // Only containers should handle drag over
    if (!isValidDrop(element)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    setDragOver(true);
    e.dataTransfer.dropEffect = "move";
    // What is dropEffect????
  };

  const onElementDragLeave = (e) => {
    // Only containers should handle drag leave
    if (!isValidDrop(element)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragOver to false if we're actually leaving this element
    // (not entering a child element)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const onElementDrop = (e) => {
    // Only containers should handle drops
    if (!isValidDrop(element)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    console.log("Drop on container:", element.id);
    
    const draggedId = e.dataTransfer.getData("elementId");
    
    // Don't drop on self
    if (draggedId === element.id) {
      console.log("Cannot drop element on itself");
      return;
    }

    const draggedElement = findDraggedElement(elements, draggedId);
    
    if (!draggedElement) {
      console.log("Dragged element not found");
      return;
    }

    if (isDescendant(draggedElement, element.id)) {
      console.log("Cannot drop parent into its own child");
      return;
    }

    // Perform the drop operation
    const result = popDraggedElement(elements, draggedId);
    if (result) {
      const updatedElements = updateElementsById(
        result.updated, 
        element.id, 
        (el) => ({
          ...el,
          children: [...(el.children || []), result.extracted]
        })
      );
      
      setElements(updatedElements);
      console.log("Drop successful - moved", draggedElement.type, "into", element.type);
    }
  };

  const Component = element.component;

  // Create style with drag over indication for containers only
  const elementStyle = {
    ...element.style,
    ...(dragOver && isValidDrop(element) ? {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      borderStyle: 'solid'
    } : {})
  };

  return (
    <Component 
      {...element.props}
      style={elementStyle}
      draggable={true}
      onDragStart={onElementDragStart}
      onDragOver={onElementDragOver}
      onDragLeave={onElementDragLeave}
      onDrop={onElementDrop}
    >
      {element.children?.map((child) => (
        <Canvas element={child} key={child.id} />
      ))}
    </Component>
  );
};

// Demo component with sample data that creates proper HTML structure
const DragDropDemo = () => {
  const [elements, setElements] = useState([
    {
      id: '1',
      type: 'div',
      component: Container,
      props: { tag: 'div', className: "container-box" },
      style: {
        width: "300px",
        minHeight: "150px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxSizing: "border-box",
        border: "2px dashed #3b82f6",
        borderRadius: "8px",
        padding: "1rem",
        margin: "10px",
        backgroundColor: "#f8fafc"
      },
      isContainer: true,
      children: []
    },
    {
      id: '2',
      type: 'div',
      component: Container,
      props: { tag: 'div', className: "container-box" },
      style: {
        width: "300px",
        minHeight: "150px",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "10px",
        boxSizing: "border-box",
        border: "2px dashed #10b981",
        borderRadius: "8px",
        padding: "1rem",
        margin: "10px",
        backgroundColor: "#f0fdf4"
      },
      isContainer: true,
      children: []
    },
    {
      id: '3',
      type: 'h1',
      component: Text,
      props: { tag: 'h1', text: 'Main Heading', className: "heading-element" },
      style: {
        padding: "8px 12px",
        margin: "5px",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        cursor: "move",
        fontSize: "24px",
        fontWeight: "bold"
      },
      isContainer: false,
      children: []
    },
    {
      id: '4',
      type: 'h2',
      component: Text,
      props: { tag: 'h2', text: 'Sub Heading', className: "subheading-element" },
      style: {
        padding: "6px 10px",
        margin: "5px",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        cursor: "move",
        fontSize: "20px",
        fontWeight: "600"
      },
      isContainer: false,
      children: []
    },
    {
      id: '5',
      type: 'p',
      component: Text,
      props: { tag: 'p', text: 'This is a paragraph', className: "paragraph-element" },
      style: {
        padding: "8px 12px",
        margin: "5px",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        cursor: "move"
      },
      isContainer: false,
      children: []
    },
    {
      id: '6',
      type: 'p',
      component: Text,
      props: { tag: 'p', text: 'Another paragraph', className: "paragraph-element" },
      style: {
        padding: "8px 12px",
        margin: "5px",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        cursor: "move"
      },
      isContainer: false,
      children: []
    }
  ]);

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

  // Debug function to show current HTML structure
  const renderStructure = (elements, depth = 0) => {
    return elements.map(el => (
      <div key={el.id} style={{ marginLeft: depth * 20 }}>
        <code>{`<${el.type}>${el.props.text || ''}`}</code>
        {el.children && el.children.length > 0 && renderStructure(el.children, depth + 1)}
        <code>{`</${el.type}>`}</code>
      </div>
    ));
  };

  return (
    <ElementStore.Provider value={{ elements, setElements }}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Fixed Drag & Drop - Proper HTML Structure</h2>
        <p className="mb-4 text-gray-600">
          Now drag elements directly without wrapper divs. Blue container uses flexbox column, green uses flexbox row.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Visual Canvas</h3>
            <div
              className="min-h-96 border-4 border-gray-300 rounded-lg p-4 bg-gray-50"
              onDrop={onCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex flex-wrap gap-4">
                {elements.map((el) => (
                  <Canvas element={el} key={el.id} />
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Generated HTML Structure</h3>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
              {renderStructure(elements)}
            </div>
          </div>
        </div>
      </div>
    </ElementStore.Provider>
  );
};

export default DragDropDemo;