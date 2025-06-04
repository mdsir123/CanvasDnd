

import React from 'react'


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
export default Container

