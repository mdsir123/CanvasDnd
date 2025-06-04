
import React from 'react'


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

export default Text


