import React, { useState } from 'react';

import { InitNodeSize } from '../../shared/elementSizes';

export const DropZone = ({ onDrop }) => {
  const [active, setActive] = useState(false);
  return (
    <div
      className="drop-zone"
      style={{
        width: InitNodeSize.width,
        height: 30,
        left: -InitNodeSize.width / 2,
        top: -10,
        border: active ? '2px dashed lightblue' : 'none',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
      }}
      onDragOver={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={e => {
        e.stopPropagation();
        setActive(true);
      }}
      onDrop={e => {
        setActive(false);
        const sourceNodeId = e.dataTransfer.getData('text/plain');
        onDrop(sourceNodeId);
      }}
      onDragLeave={e => {
        e.stopPropagation();
        setActive(false);
      }}
    />
  );
};
