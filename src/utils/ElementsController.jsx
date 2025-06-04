

import { createContext, useState } from "react";
import Text from "../Text";
import Container from "../Container";

export const ElementStore = createContext(null)

const ElementController = ({children}) => {

const [elements, setElements] = useState([
    {
      id: '1',
      type: 'div',
      component: Container,
      props: { tag: 'div', className: "container-box" },
      style: {
        minWidth: "300px",
        minHeight: "150px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxSizing: "border-box",
        border: "1px dashed #3b82f6",
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
        minWidth: "300px",
        minHeight: "150px",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "10px",
        boxSizing: "border-box",
        border: "1px dashed #3b82f6",
        borderRadius: "8px",
        padding: "1rem",
        margin: "10px",
        backgroundColor: "#f8fafc"
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

  return (
    <ElementStore.Provider value={{elements,setElements}}>
        {children}
    </ElementStore.Provider>
  )
}

export default ElementController

