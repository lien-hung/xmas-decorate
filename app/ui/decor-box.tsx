import Image from "next/image";
import DecorItemElement from "@/app/ui/decor-item-element";
import { DraggableItem } from "@/app/lib/definitions";
import { DraggableEventHandler } from "react-draggable";
import { RndResizeCallback } from "react-rnd";

export default function DecorBox({
  tree,
  decorItems,
  exportNodeRef,
  onDragStop,
  onResizeStop
}: {
  tree: string,
  decorItems: DraggableItem[],
  exportNodeRef: React.RefObject<HTMLDivElement | null>,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback
}) {
  return (
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
          src={tree}
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
  );
}