import { DraggableEventHandler } from "react-draggable";
import { DraggableItem } from "@/app/lib/definitions";
import { Rnd, RndResizeCallback } from "react-rnd";

export default function DecorItemElement({
  item,
  onDragStop,
  onResizeStop
}: {
  item: DraggableItem,
  onDragStop: DraggableEventHandler,
  onResizeStop: RndResizeCallback
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
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
    >
      <img
        id={`${item.id}`}
        src={item.imageSrc}
        alt="Decoration item"
        draggable={false}
      />
    </Rnd>
  );
}