'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { DraggableItem } from "@/app/lib/definitions";
import Draggable, { DraggableEvent } from "react-draggable";
import { DraggableData, Position, ResizableDelta } from "react-rnd";
import { ResizeDirection } from "re-resizable";
import { toPng } from "html-to-image";
import DecorItem from "@/app/ui/decor-item";
import DecorItemElement from "@/app/ui/decor-item-element";
import { toast, ToastContainer } from "react-toastify";

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
      width: "40px", height: "40px"
    };
    setDecorItems([...decorItems, newDecorItem]);
    setNextId(nextId + 1);
  }

  function onDragStop(e: DraggableEvent, data: DraggableData) {
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

  function onResizeStop(e: MouseEvent | TouchEvent, direction: ResizeDirection, ref: HTMLElement, delta: ResizableDelta, position: Position) {
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
      {/* TODO:
      - [ ] Drag box nằm ở bên trái, có các nút chức năng như thay đổi background, cây thông/ông già 
      noel gồm 5 màu, sau đó chọn tên các phụ kiện trang trí
      - [x] Thêm nút lưu và nút xuất image
      - [ ] Khi mới vào trang sẽ có 2 nút, nút thứ nhất cho trang trí cây thông, nút thứ hai đếm ngược
      sau 1 tuần sẽ được click vào để trang trí ông già noel
      */}

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

      {/* Decor item menu */}
      <Draggable nodeRef={menuNodeRef} defaultPosition={{ x: 100, y: 100 }}>
        <div ref={menuNodeRef} className="bg-blue-500/25 max-w-fit h-auto absolute z-20 rounded-md">
          <div className="flex flex-col">
            <button
              disabled={itemPage <= 0}
              onClick={() => setItemPage(itemPage - 1)}
            >
              <Image
                src="/assets/up-arrow.png"
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
              <Image
                src="/assets/down-arrow.png"
                alt="Down arrow"
                width={32} height={32}
                className={`m-auto ${itemPage >= maxItemPage ? "opacity-25" : ""}`}
              />
            </button>
          </div>
        </div>
      </Draggable>

      {/* Decor box */}
      <div
        className={`
          w-[1000px] h-[600px]
          border-8 border-solid border-blue-300
          absolute left-0 right-0 top-0 bottom-0 m-auto
          overflow-y-scroll
        `}
      >
        <div ref={exportNodeRef}>
          {/* Main tree image */}
          <Image
            src="/tree.jpg"
            alt="Decoration tree"
            width={800} height={1200}
            className="m-auto"
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
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
    </>
  );
}