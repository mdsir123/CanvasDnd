import { useState } from "react";

const ALIGN_THRESHOLD = 1;

const DragResize = () => {
  const [elements, setElements] = useState([
    { id: 1, x: 50, y: 100, width: 100, height: 100 },
    { id: 2, x: 300, y: 150, width: 100, height: 100 },
    { id: 3, x: 600, y: 150, width: 100, height: 50 },
  ]);

  const [draggingId, setDraggingId] = useState(null);
  const [guides, setGuides] = useState([]);
  const [fadeGuides, setFadeGuides] = useState(false);
  const [beforeResize,setBeforeResize] = useState({})
  const [interactMode, setInteractMode] = useState('none');



  const handleMouseDown = (id) => {
    setDraggingId(id);
    setInteractMode('drag')
    console.log(id, "dragging started");
  };

  const handleMouseMove = (e) => {

    if( interactMode != 'drag') return
    if (!draggingId) return;

    const newX = e.clientX - 50;
    const newY = e.clientY - 50;

    const updatedElements = elements.map((el) =>
      el.id === draggingId ? { ...el, x: newX, y: newY } : el
    );

    setElements(updatedElements);
    calculateGuides(updatedElements, draggingId);
  };

  const handleMouseUp = () => {
    setDraggingId(null);

    setFadeGuides(true);

    setTimeout(() => {
      setGuides([]);
      setFadeGuides(false);
    }, 1000);
    setInteractMode('none')

  };

  const calculateGuides = (all, movingId) => {
    const movingEl = all.find((el) => el.id === movingId);
    const otherEls = all.filter((el) => el.id !== movingId);

    const newGuides = [];

    for (const el of otherEls) {
      if (Math.abs(el.x - movingEl.x) < ALIGN_THRESHOLD) {
        newGuides.push({ type: "v", x: el.x });
      }
      if (
        Math.abs(el.x + el.width / 2 - (movingEl.x + movingEl.width / 2)) <
        ALIGN_THRESHOLD
      ) {
        newGuides.push({ type: "v", x: el.x + el.width / 2 });
      }
      if (
        Math.abs(el.x + el.width - (movingEl.x + movingEl.width)) <
        ALIGN_THRESHOLD
      ) {
        newGuides.push({ type: "v", x: el.x + el.width });
      }

      if (Math.abs(el.y - movingEl.y) < ALIGN_THRESHOLD) {
        newGuides.push({ type: "h", y: el.y });
      }
      if (
        Math.abs(el.y + el.height / 2 - (movingEl.y + movingEl.height / 2)) <
        ALIGN_THRESHOLD
      ) {
        newGuides.push({ type: "h", y: el.y + el.height / 2 });
      }
      if (
        Math.abs(el.y + el.height - (movingEl.y + movingEl.height)) <
        ALIGN_THRESHOLD
      ) {
        newGuides.push({ type: "h", y: el.y + el.height });
      }
    }

    setGuides(newGuides);
  };


  const onAddClick = () => {
    setElements([...elements,{ id: crypto.randomUUID(), x: 60, y: 0, width: 100, height: 100 }])
  } 



  const onResizeMouseDown = (e,id) =>{
    const resizeEl = elements.find((el)=> el.id === id)
    const beforeDimensions = {id:resizeEl.id, startWidth:resizeEl.width, startHeight:resizeEl.height, startMouseX:e.clientX, startMouseY:e.clientY}
    setBeforeResize(beforeDimensions)
    setInteractMode('resize')
    console.log(beforeDimensions)
  }

  const onResizeMouseMove = (e) => {

    e.stopPropagation()
    if(interactMode != 'resize') return;
    console.log(interactMode)
    const elemId = beforeResize.id;
    const newWidth = beforeResize.startWidth + e.clientX - beforeResize.startMouseX 
    const newHeight = beforeResize.startHeight + e.clientY - beforeResize.startMouseY
    console.log(elemId, newWidth, newHeight)
    const updatedElementDimensions = elements.map((el) => el.id === elemId ? {...el,width:newWidth, height:newHeight} : el)
    setElements(updatedElementDimensions)
  }


  const onResizeMouseUp = () =>{
    setBeforeResize({})
    setInteractMode('none')
  }

  return (
    <div
      className="relative w-full h-screen bg-gray-100"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute bg-blue-300 border-2 border-dotted cursor-move"
          onMouseDown={() => handleMouseDown(el.id)}
          style={{
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
          }}
        >
          <h1>Div </h1>
        <>
            <div className="h-2 w-2 border-2 absolute -top-1 -left-1 bg-black" onMouseDown={()=>onResizeMouseDown(el.id)} />
            <div className="h-2 w-2 border-2 absolute -top-1 -right-1 bg-black" onMouseDown={()=>onResizeMouseDown(el.id)}/>
            <div className="h-2 w-2 border-2 absolute -bottom-1 -left-1 bg-black" onMouseDown={()=>onResizeMouseDown(el.id)}/>
            <div className="h-2 w-2 border-2 absolute -bottom-1 -right-1 bg-black" onMouseDown={(e)=>onResizeMouseDown(e,el.id)} onMouseMove={onResizeMouseMove} onMouseUp={onResizeMouseUp}/>
        </>

        </div>
      ))}


      {guides.map((g,i)=> {
        if(g.type !== "v" && g.type !== "h" ) return null;
        const isVertical = g.type === "v"
        const style = isVertical ? {left : g.x, height:"100%"} : {top : g.y, width:"100%"}

        return (
            <div
            key={i}
            className={`absolute  border-dashed border-red-500 z-50 ${isVertical?"border-l-2 h-full":"border-t-2 w-full"} ${
                fadeGuides
                  ? "opacity-0 transition-opacity duration-1000"
                  : "opacity-100"
              }`}
            style={style}
            
            />
        )
      })}

      <button className="btn btn-soft btn-success z-[100]" onClick={onAddClick}>Add</button>

    </div>
  );
};

export default DragResize;
