

import { useState, useContext } from "react";
import { ElementStore } from "./utils/ElementsController";

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
  };

  const onElementDragOver = (e) => {
    if (!isValidDrop(element)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    setDragOver(true);
    e.dataTransfer.dropEffect = "move";
  };

  const onElementDragLeave = (e) => {
    if (!isValidDrop(element)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
 
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const onElementDrop = (e) => {
    if (!isValidDrop(element)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    console.log("Drop on container:", element.id);
    
    const draggedId = e.dataTransfer.getData("elementId");
    
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

export default Canvas


