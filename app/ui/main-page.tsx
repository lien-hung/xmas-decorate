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
import ExportModal from "@/app/ui/export-modal";
import CapturingModal from "@/app/ui/capturing-modal";
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
  // Node refs
  const exportNodeRef = React.useRef<HTMLDivElement>(null);
  const treeMenuRef = React.useRef<HTMLDivElement>(null);

  // State
  const [selectedMenu, setSelectedMenu] = useState<'trees' | 'pets' | 'ribbons' | 'items'>('trees');
  const [currentTree, setCurrentTree] = useState(treeLinks[0] || "");
  const [currentMenu, setCurrentMenu] = useState<string[]>([]);
  const [treeSubMenu, setTreeSubMenu] = useState<string[]>([]);
  const [decorItems, setDecorItems] = useState<DraggableItem[]>([]);
  const [nextId, setNextId] = useState(0);
  const [touchExpiration, setTouchExpiration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);

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
  }, [selectedMenu]);

  function addDecorItem(imgLink: string) {
    const newDecorItem: DraggableItem = {
      id: nextId,
      imageSrc: imgLink,
      x: 0, y: 0,
      width: 200, height: 200
    };
    setDecorItems([...decorItems, newDecorItem]);
    setNextId(nextId + 1);
  }

  function deleteDecorItem(e: React.MouseEvent<HTMLImageElement>) {
    setDecorItems(decorItems.filter(item => item.id !== Number(e.currentTarget.id)));
  }

  function deleteItemOnDoubleTouch(e: React.TouchEvent<HTMLImageElement>) {
    if (e.touches.length === 1) {
      if (!touchExpiration) {
        setTouchExpiration(e.timeStamp + 400);
      } else if (e.timeStamp <= touchExpiration) {
        // Reset for other double touch events
        setDecorItems(decorItems.filter(item => item.id !== Number(e.currentTarget.id)));
        setTouchExpiration(0);
      } else {
        // Second touch expired
        setTouchExpiration(e.timeStamp + 400);
      }
    }
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
        return { ...item, ...position, width: ref.offsetWidth, height: ref.offsetHeight };
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

  async function handleExport() {
    if (!exportNodeRef.current || isExporting) return;

    setIsExporting(true);
    const node = exportNodeRef.current;

    try {
      // Force reflow and ensure visibility
      node.style.visibility = 'visible';
      const _ = node.offsetWidth;

      // Wait for all images with improved detection
      const imgs = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
      
      const imgLoadPromises = imgs.map(img => {
        return new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Image load timeout:', img.src);
            resolve();
          }, 8000);

          // Check if image is already loaded and valid
          if (img.complete && img.naturalHeight > 0 && img.naturalWidth > 0) {
            clearTimeout(timeout);
            resolve();
          } else {
            const onLoad = () => {
              clearTimeout(timeout);
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              resolve();
            };
            const onError = () => {
              clearTimeout(timeout);
              console.warn('Image failed to load:', img.src);
              img.removeEventListener('load', onLoad);
              img.removeEventListener('error', onError);
              resolve();
            };
            img.addEventListener('load', onLoad, { once: true });
            img.addEventListener('error', onError, { once: true });

            // Force reload if pending
            if (!img.complete) {
              const originalSrc = img.src;
              img.src = '';
              setTimeout(() => { img.src = originalSrc; }, 10);
            }
          }
        });
      });

      await Promise.all(imgLoadPromises);

      // Wait for fonts with timeout
      if ((document as any).fonts?.ready) {
        try {
          await Promise.race([
            (document as any).fonts.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Font timeout')), 3000))
          ]);
        } catch (err) {
          console.warn('Font loading timeout or failed', err);
        }
      }

      // Extended delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 600));

      // Generate PNG with optimized settings
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: node.clientWidth * 2,
        canvasHeight: node.clientHeight * 2,
        backgroundColor: '#ffffff',
      });

      // Show result modal
      setExportedImageUrl(dataUrl);
      setExportModalOpen(true);
      toast.success('Image ready!');
    } catch (err) {
      console.error('Export failed:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Capture failed: ${errorMsg}`);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSaveImage() {
    if (!exportedImageUrl) return;
    setIsSavingImage(true);

    try {
      const link = document.createElement('a');
      link.download = `xmas-decorate-${Date.now()}.png`;
      link.href = exportedImageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Image saved successfully!');
      setExportModalOpen(false);
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Failed to save image');
    } finally {
      setIsSavingImage(false);
    }
  }

  async function handleCopyImage() {
    if (!exportedImageUrl) return;
    setIsCopyingImage(true);

    try {
      const response = await fetch(exportedImageUrl);
      const blob = await response.blob();

      // Use Clipboard API to copy image
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        toast.success('Image copied to clipboard!');
      } else {
        toast.warning('Copy not supported on this browser');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy image');
    } finally {
      setIsCopyingImage(false);
    }
  }

  async function handleShareToX() {
    if (!exportedImageUrl) return;

    try {
      const quote = 'Ritual - Merry Christmas 🎄\n#Ritualnet #Ritual';
      
      // Fetch the image as blob
      const response = await fetch(exportedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'xmas-decorate.png', { type: 'image/png' });

      // Try Web Share API (works on mobile and some desktop browsers)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ritual Xmas Decoration',
          text: quote,
        });
        toast.success('Shared to X!');
        setExportModalOpen(false);
      } else {
        // Fallback: Open X in new tab with quote, user can paste image
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}`;
        window.open(tweetUrl, '_blank', 'width=600,height=400');
        
        // Copy image to clipboard for easy pasting
        if (navigator.clipboard?.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          toast.success('X opened! Image copied - press Ctrl+V to paste in tweet');
        } else {
          toast.info('X opened! Please upload image manually');
        }
        
        setExportModalOpen(false);
      }
    } catch (err) {
      console.error('Share failed:', err);
      // Fallback: just open X
      const quote = 'Ritual - Merry Christmas 🎄\n#Ritualnet #Ritual';
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}`;
      window.open(tweetUrl, '_blank', 'width=600,height=400');
      setExportModalOpen(false);
      toast.warning('X opened! Please upload image manually');
    }
  }

  // Close tree sub-menu when clicking/tapping outside the menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (!treeMenuRef.current) return;
      const target = e.target as Node | null;
      if (target && !treeMenuRef.current.contains(target)) {
        setTreeSubMenu([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Merry Christmas blinking text */}
      <h1 className="blink-red-yellow whitespace-nowrap">Merry Christmas</h1>

      {/* Save and share */}
      <div className="absolute z-20 top-3 right-3">
        <button
          className="bg-blue-400 p-1 rounded-md mr-1"
          onClick={handleSave}
        >
          <span className="font-bold">Save</span>
        </button>
        <button
          className="bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed p-1 rounded-md ml-1 text-white"
          onClick={handleExport}
          disabled={isExporting}
        >
          <span className="font-bold">{isExporting ? 'Preparing...' : 'Share to X'}</span>
        </button>
      </div>

      {/* Menu */}
      <div className="fixed bottom-0 md:m-0 md:top-19.75 md:translate-y-0 md:h-fit">
        <div className="flex flex-row w-screen bg-blue-500/25 justify-center md:flex-col md:w-fit md:mb-4 rounded-[7%]">
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

        {/* Tree and item menu */}
        <div className="md:h-fit md:max-h-[60vh] overflow-x-scroll overflow-y-hidden md:overflow-x-hidden md:overflow-y-scroll bg-blue-500/25 rounded-[7%]">
          {/* attach ref to detect outside clicks */}
          <div ref={treeMenuRef} className="w-screen whitespace-nowrap md:w-fit md:max-h-full">
            {/* Tree menu */}
            <ul className="flex flex-row md:flex-col">
              {selectedMenu === 'trees' &&
                treeLinks
                  .filter(link => link.endsWith(".1.png"))
                  .map((link, idx) => (
                    <li key={link}>
                      <button
                        className={`w-16 h-16 m-3 inline-block peer ${currentTree === link ? 'ring-4 ring-yellow-300 bg-blue-700' : 'bg-blue-500/50'}`}
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
                      <ul className="relative rounded-md md:absolute bg-red-300 hidden peer-[.ring-yellow-300]:inline-block md:ml-5">
                        {/* Tree sub-menu */}
                        {treeSubMenu.length > 0 && treeSubMenu.map(link => (
                          <li
                            key={link}
                            className="inline-block"
                          >
                            <DecorItem
                              imageSrc={link}
                              handleOnClick={() => addDecorItem(link)}
                            />
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                  )
              }
            </ul>
          </div>

          {/* Item menu */}
          {selectedMenu !== 'trees' && (
            <div className="w-screen whitespace-nowrap md:w-fit md:flex md:flex-col">
              {currentMenu.map(link => (
                <DecorItem
                  key={link}
                  imageSrc={link}
                  handleOnClick={() => addDecorItem(link)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-[100vmin] max-w-3xl aspect-video border-8 border-solid border-blue-300 overflow-hidden absolute top-0 bottom-0 left-0 right-0 m-auto rounded-[7%]">
        <DecorBox
          tree={currentTree}
          decorItems={decorItems}
          exportNodeRef={exportNodeRef}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          onDoubleClick={deleteDecorItem}
          onTouchStart={deleteItemOnDoubleTouch}
        />
      </div>

      <Snowfall />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />

      {/* Export Modal */}
      <CapturingModal isOpen={isExporting} />
      <ExportModal
        isOpen={exportModalOpen}
        imageUrl={exportedImageUrl}
        onClose={() => setExportModalOpen(false)}
        onCopy={handleCopyImage}
        onSave={handleSaveImage}
        onShare={handleShareToX}
        isCopying={isCopyingImage}
        isSaving={isSavingImage}
      />
    </>
  );
}