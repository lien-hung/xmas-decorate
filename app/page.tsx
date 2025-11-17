'use client';

import React, { useState } from "react";
import Image from "next/image";
import Draggable, { DraggableEvent } from "react-draggable";
import { DraggableItem } from "@/app/lib/definitions";
import DecorItem from "@/app/ui/decor-item";
import DecorItemElement from "./ui/decor-item-element";
import { ResizeDirection } from "re-resizable";
import { DraggableData, Position, ResizableDelta } from "react-rnd";

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
      x: 0, y: 0,
      width: "40px", height: "40px"
    };
    setDecorItems([...decorItems, newDecorItem]);
    setNextId(nextId + 1);
  }

  function onDragStop(e: DraggableEvent, data: DraggableData) {
    const imgNode = data.node.querySelector("img");
    if (!imgNode) return;
    const newDecorItems = decorItems.slice();
    const modifiedId = Number(imgNode.id);
    
    if (!newDecorItems[modifiedId]) return;
    newDecorItems[modifiedId].x = data.x;
    newDecorItems[modifiedId].y = data.y;

    setDecorItems(newDecorItems);
    console.log(newDecorItems);
  }

  function onResizeStop(e: MouseEvent | TouchEvent, direction: ResizeDirection, ref: HTMLElement, delta: ResizableDelta, position: Position) {
    const imgNode = ref.querySelector("img");
    if (!imgNode) return;
    const newDecorItems = decorItems.slice();
    const modifiedId = Number(imgNode.id);

    if (!newDecorItems[modifiedId]) return;
    newDecorItems[modifiedId].width = ref.style.width;
    newDecorItems[modifiedId].height = ref.style.height;

    setDecorItems(newDecorItems);
    console.log(setDecorItems);
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
        width={1000} height={1500}
        className="absolute z-0 left-0 right-0 mx-auto"
        draggable={false}
      />

      {/* Render current decoration items */}
      {decorItems.map((item) => (
        <DecorItemElement
          key={`decor-el-${item.id}`}
          item={item}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        />
      ))}
    </>
  );
}
