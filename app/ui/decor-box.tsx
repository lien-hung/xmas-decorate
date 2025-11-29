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
    <div ref={exportNodeRef} className="w-full h-full">
      {/* Main tree image */}
      <img
        src={tree}
        alt="Decoration tree"
        className="m-auto w-auto h-full"
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
  );
}