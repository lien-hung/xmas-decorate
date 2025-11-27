import { MouseEventHandler } from "react";

export default function DecorItem({
  imageSrc,
  handleOnClick
}: {
  imageSrc: string,
  handleOnClick: MouseEventHandler
}) {
  return (
    <button
      className="bg-blue-500/50 w-18 h-18 m-3 flex justify-center"
      onClick={handleOnClick}
    >
      <img
        src={imageSrc}
        alt="Decoration item"
        width={100} height={100}
        className="overflow-hidden"
      />
    </button>
  );
}