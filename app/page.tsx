'use client';

import React, { useState } from "react";
import Image from "next/image";
import Draggable from "react-draggable";
import { DraggableItem } from "@/app/lib/definitions";
import DecorItem from "@/app/ui/decor-item";

export default function Home() {
  const itemLinks = [
    "/items/img1.jpg",
    "/items/img2.jpg",
  ];

  const [decorItems, setDecorItems] = useState(new Array<DraggableItem>());
  const [nextId, setNextId] = useState(0);
  const nodeRef = React.useRef(null);

  function addDecorItem(imgLink: string) {
    const newDecorItem: DraggableItem = {
      id: nextId,
      imageSrc: imgLink,
      startX: 0,
      startY: 0
    };
    setDecorItems([...decorItems, newDecorItem]);
    setNextId(nextId + 1);
  }

  return (
    <>
      {/* Decor item menu */}
      <Draggable nodeRef={nodeRef} defaultPosition={{ x: 100, y: 100 }}>
        <div ref={nodeRef} className="bg-blue-500/25 max-w-fit h-auto absolute z-20">
          {itemLinks.map(itemLink => (
            <DecorItem
              key={itemLink}
              imageSrc={itemLink}
              handleOnClick={() => addDecorItem(itemLink)}
            />
          ))}
        </div>
      </Draggable>

      {/* Main tree image */}
      <Image
        src="/tree.jpg"
        alt="Decoration tree"
        width={500} height={750}
        className="absolute z-0 h-full left-0 right-0 mx-auto"
      />

      {/* Render current decoration items */}
      {decorItems.map((item, index) => (
        <Draggable
          key={index}
          nodeRef={nodeRef}
          positionOffset={{ x: item.startX, y: item.startY }}
        >
          <img
            src={item.imageSrc}
            alt="Decoration item"
            width={40} height={40}
            className="absolute z-10"
            draggable={false}
          />
        </Draggable>
      ))}
    </>
  );
}
