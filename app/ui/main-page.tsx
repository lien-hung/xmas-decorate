'use client';

import React, { useEffect, useState } from "react";
import { DraggableItem } from "@/app/lib/definitions";
import { DraggableEvent } from "react-draggable";
import { DraggableData, Position, ResizableDelta } from "react-rnd";
import { ResizeDirection } from "re-resizable";
import { toPng } from "html-to-image";
import DecorItem from "@/app/ui/decor-item";
import { toast, ToastContainer } from "react-toastify";
import DecorBox from "@/app/ui/decor-box";
import Snowfall from "react-snowfall";

export default function MainPage({
  treeLinks,
  itemLinks,
  petLinks,
  ribbonLinks,
}: {
  treeLinks: string[],
  itemLinks: string[],
  petLinks: string[],
  ribbonLinks: string[],
}) {
  // Pagination
  const itemsPerPage = 5;

  // Node refs
  const exportNodeRef = React.useRef<HTMLDivElement>(null);

  // State
  const [selectedMenu, setSelectedMenu] = useState<'trees' | 'pets' | 'ribbons' | 'items'>('trees');
  const [currentTree, setCurrentTree] = useState(treeLinks[0] || "");
  const [currentMenu, setCurrentMenu] = useState<string[]>([]);
  const [treeSubMenu, setTreeSubMenu] = useState<string[]>([]);
  const [decorItems, setDecorItems] = useState<DraggableItem[]>([]);
  const [nextId, setNextId] = useState(0);
  const [itemPage, setItemPage] = useState(0);

  const maxItemPage = Math.floor(currentMenu.length / itemsPerPage);
  const pageStartIndex = itemPage * itemsPerPage;
  const pageEndIndex = pageStartIndex + itemsPerPage;

  // Handle saved session
  useEffect(() => {
    setCurrentTree(localStorage.getItem("currentTree") || treeLinks[0]);

    const savedDecorItemsJson = localStorage.getItem("currentItems") || "[]";
    const savedDecorItems = JSON.parse(savedDecorItemsJson) as Array<DraggableItem>;
    setDecorItems(savedDecorItems);

    const lastSavedItem = savedDecorItems && savedDecorItems[-1];
    if (lastSavedItem) {
      setNextId(lastSavedItem.id + 1);
    }
  }, []);

  useEffect(() => {
    switch (selectedMenu) {
      case "trees": setCurrentMenu(treeLinks); break;
      case "pets": setCurrentMenu(petLinks); break;
      case "ribbons": setCurrentMenu(ribbonLinks); break;
      case "items": setCurrentMenu(itemLinks); break;
    }
    setItemPage(0);
  }, [selectedMenu]);

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

  // function deleteDecorItem(e: React.MouseEvent<HTMLDivElement>) {
  //   setDecorItems(decorItems.filter(item => item.id !== Number(e.currentTarget.id)));
  // }

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
    localStorage.setItem("currentTree", currentTree);
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

      {/* Menu */}
      <div className="bg-blue-500/25 max-w-fit absolute top-0 bottom-0">
        <div className="flex flex-col">
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'trees' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('trees')}
            aria-pressed={selectedMenu === 'trees'}
          >
            Trees
          </button>
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'pets' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('pets')}
            aria-pressed={selectedMenu === 'pets'}
          >
            Pets
          </button>
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'ribbons' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('ribbons')}
            aria-pressed={selectedMenu === 'ribbons'}
          >
            Ribbons
          </button>
          <button
            className={`m-2 p-2 font-bold rounded-md ${selectedMenu === 'items' ? 'bg-blue-700' : 'bg-blue-300'}`}
            onClick={() => setSelectedMenu('items')}
            aria-pressed={selectedMenu === 'items'}
          >
            Items
          </button>
        </div>

        {/* Menu */}
        <div className="flex flex-col m-auto items-center">
          <div className="relative">
            {/* Tree menu */}
            {selectedMenu === 'trees' &&
              treeLinks
                .filter(link => link.endsWith(".1.png"))
                .map((link, idx) => (
                  <button
                    key={link}
                    className={`w-16 h-16 m-3 flex justify-center items-center peer ${currentTree === link ? 'ring-4 ring-yellow-300 bg-blue-700' : 'bg-blue-500/50'}`}
                    onClick={() => {
                      setCurrentTree(link);
                      setTreeSubMenu(treeLinks.filter(link => link.startsWith(`trees/${idx + 1}`) && (link.split('/').pop() || link) !== `${idx + 1}.1.png`));
                    }}
                  >
                    <img
                      src={link}
                      alt="Decoration tree"
                      width={40} height={40}
                      className="w-fit h-fit m-auto"
                    />
                  </button>
                )
                )
            }

            {/* Tree sub-menu */}
            {selectedMenu === 'trees' && treeSubMenu.length > 0 && (
              <div className="absolute flex flex-col top-0 left-25 bg-blue-700 rounded-lg">
                {treeSubMenu.map(link => (
                  <DecorItem
                    key={link}
                    imageSrc={link}
                    handleOnClick={() => addDecorItem(link)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Item menu */}
          {selectedMenu !== 'trees' && (
            <>
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
              {currentMenu.slice(pageStartIndex, pageEndIndex).map(link => (
                <DecorItem
                  key={link}
                  imageSrc={link}
                  handleOnClick={() => addDecorItem(link)}
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
            </>
          )}
        </div>
      </div>

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