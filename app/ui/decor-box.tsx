import DecorItemElement from "@/app/ui/decor-item-element";
import Image from "next/image";
import { DraggableItem } from "@/app/lib/definitions";
import { DraggableEventHandler } from "react-draggable";
import { RndResizeCallback } from "react-rnd";
import { MouseEventHandler, TouchEventHandler } from "react";

export default function DecorBox({
  tree,
  decorItems,
  exportNodeRef,
  onDragStop,
  onResizeStop,
  onDoubleClick,
  onTouchStart
}: {
  tree: string,
  decorItems: DraggableItem[],
  exportNodeRef: React.RefObject<HTMLDivElement | null>,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>,
  onTouchStart: TouchEventHandler<HTMLImageElement>
}) {
  return (
    <div ref={exportNodeRef} className="w-full h-full relative">
      {/* White background image */}
      <Image
        src="/assets/white.jpg"
        alt="Background"
        fill
        sizes="100vw"
        style={{ objectFit: 'cover' }}
        quality={100}
        draggable={false}
        className="absolute inset-0"
      />
      
      {/* Main tree image */}
      <div className="relative w-full h-full">
        <Image
          src={`/${tree}`}
          alt="Decoration tree"
          fill
          sizes="100vw"
          style={{ objectFit: 'contain' }}
          quality={100}
          draggable={false}
        />
      </div>
      {/* Render current decoration items */}
      {decorItems.map((item) => (
        <DecorItemElement
          key={`decor-el-${item.id}`}
          item={item}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
        />
      ))}
    </div>
  );
}