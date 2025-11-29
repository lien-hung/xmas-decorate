import { DraggableEventHandler } from "react-draggable";
import { DraggableItem } from "@/app/lib/definitions";
import { Rnd, RndResizeCallback } from "react-rnd";
import { MouseEventHandler } from "react";

export default function DecorItemElement({
  item,
  onDragStop,
  onResizeStop,
  onDoubleClick
}: {
  item: DraggableItem,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback,
  onDoubleClick: MouseEventHandler<HTMLImageElement>
}) {
  return (
    <Rnd
      size={{
        width: item.width,
        height: item.height
      }}
      position={{
        x: item.x,
        y: item.y
      }}
      bounds="parent"
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      className="hover:border-2 hover:border-gray-400 active:border-2 active:border-gray-400"
    >
      <img
        id={`${item.id}`}
        src={item.imageSrc}
        alt="Decoration item"
        draggable={false}
        onDoubleClick={onDoubleClick}
      />
    </Rnd>
  );
}