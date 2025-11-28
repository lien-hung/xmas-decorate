'use client';

import React, { useEffect, useState } from "react";
import { DraggableItem } from "@/app/lib/definitions";
import Draggable, { DraggableEvent } from "react-draggable";
import { DraggableData, Position, ResizableDelta } from "react-rnd";
import { ResizeDirection } from "re-resizable";
import { toPng } from "html-to-image";
import DecorItem from "@/app/ui/decor-item";
import { toast, ToastContainer } from "react-toastify";
import DecorBox from "@/app/ui/decor-box";
import Snowfall from "react-snowfall";

export default function MainPage({
  itemLinks,
  treeLinks
}: {
  itemLinks: string[],
  treeLinks: string[]
}) {
  // Pagination
  const itemsPerPage = 4;
  const maxItemPage = Math.floor(itemLinks.length / itemsPerPage);

  // Node refs
  const menuNodeRef = React.useRef(null);
  const exportNodeRef = React.useRef<HTMLDivElement>(null);

  // State
  const [currentTree, setCurrentTree] = useState(treeLinks[0] || "");
  const [decorItems, setDecorItems] = useState<DraggableItem[]>([]);
  const [nextId, setNextId] = useState(0);
  const [itemPage, setItemPage] = useState(0);
  const pageStartIndex = itemPage * itemsPerPage;
  const pageEndIndex = pageStartIndex + itemsPerPage;

  // Handle saved session
  useEffect(() => {
    const savedDecorItemsJson = localStorage.getItem("currentItems") || "[]";
    const savedDecorItems = JSON.parse(savedDecorItemsJson) as Array<DraggableItem>;
    setDecorItems(savedDecorItems);

    const lastSavedItem = savedDecorItems && savedDecorItems[-1];
    if (lastSavedItem) {
      setNextId(lastSavedItem.id + 1);
    }
  }, []);

  function addDecorItem(imgLink: string) {
    const newDecorItem: DraggableItem = {
      id: nextId,
      imageSrc: imgLink,
      x: 0, y: 0,
      width: "100px", height: "100px"
    };
    setDecorItems([...decorItems, newDecorItem]);
    setNextId(nextId + 1);
  }

  function handleDragStop(e: DraggableEvent, data: DraggableData) {
    const imgNode = data.node.querySelector("img");
    if (!imgNode) return;
    const modifiedId = Number(imgNode.id);

    setDecorItems(decorItems.map(item => {
      if (item.id === modifiedId) {
        return { ...item, x: data.x, y: data.y };
      } else {
        return item;
      }
    }));
  }

  function handleResizeStop(e: MouseEvent | TouchEvent, direction: ResizeDirection, ref: HTMLElement, delta: ResizableDelta, position: Position) {
    const imgNode = ref.querySelector("img");
    if (!imgNode) return;
    const modifiedId = Number(imgNode.id);

    setDecorItems(decorItems.map(item => {
      if (item.id === modifiedId) {
        return { ...item, width: ref.style.width, height: ref.style.height };
      } else {
        return item;
      }
    }));
  }

  function handleSave() {
    localStorage.setItem("currentItems", JSON.stringify(decorItems));
    toast("Saved decoration successfully");
  }

  function handleExport() {
    if (!exportNodeRef.current) {
      return;
    }

    toPng(exportNodeRef.current, { cacheBust: true })
      .then(dataUrl => {
        const link = document.createElement("a");
        link.download = "image.png";
        link.href = dataUrl;
        link.click();
      })
      .catch(error => {
        console.error(error);
      });
  }

  return (
    <>
      {/* Save and export */}
      <div className="absolute z-20 top-3 right-3">
        <button
          className="bg-blue-400 p-1 rounded-md mr-1"
          onClick={handleSave}
        >
          <span className="font-bold">Save</span>
        </button>
        <button
          className="bg-green-400 p-1 rounded-md ml-1"
          onClick={handleExport}
        >
          <span className="font-bold">Export to image</span>
        </button>
      </div>

      {/* Drag menu */}
      <Draggable nodeRef={menuNodeRef} defaultPosition={{ x: 100, y: 100 }}>
        <div ref={menuNodeRef} className="bg-blue-500/25 max-w-fit h-auto absolute z-20 rounded-md flex flex-row">
          {/* Trees */}
          <div className="flex flex-col m-auto">
            {treeLinks.map(treeLink => (
              <button
                key={treeLink}
                className="bg-blue-500/50 w-16 h-16 m-3 flex justify-center items-center"
                onClick={() => setCurrentTree(treeLink)}
              >
                <img
                  src={treeLink}
                  alt="Decoration tree"
                  width={40} height={40}
                  className="w-fit h-fit m-auto"
                />
              </button>
            ))}
          </div>

          {/* Decor items */}
          <div className="flex flex-col m-auto">
            <button
              disabled={itemPage <= 0}
              onClick={() => setItemPage(itemPage - 1)}
            >
              <img
                src="assets/up-arrow.png"
                alt="Up arrow"
                width={32} height={32}
                className={`m-auto ${itemPage <= 0 ? "opacity-25" : ""}`}
              />
            </button>
            {itemLinks.slice(pageStartIndex, pageEndIndex).map(itemLink => (
              <DecorItem
                key={itemLink}
                imageSrc={itemLink}
                handleOnClick={() => addDecorItem(itemLink)}
              />
            ))}
            <button
              disabled={itemPage >= maxItemPage}
              onClick={() => setItemPage(itemPage + 1)}
            >
              <img
                src="assets/down-arrow.png"
                alt="Down arrow"
                width={32} height={32}
                className={`m-auto ${itemPage >= maxItemPage ? "opacity-25" : ""}`}
              />
            </button>
          </div>
        </div>
      </Draggable>

      <div className="w-3xl h-3xl border-8 border-solid border-blue-300 overflow-hidden absolute left-0 right-0 top-0 bottom-0 m-auto">
        <DecorBox
          tree={currentTree}
          decorItems={decorItems}
          exportNodeRef={exportNodeRef}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
        />
      </div>

      <Snowfall />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
    </>
  );
}