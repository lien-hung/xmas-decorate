import { MouseEventHandler } from "react";
import Image from "next/image";

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
      <Image
        src={imageSrc}
        alt="Decoration item"
        width={100} height={100}
        className="overflow-hidden"
      />
    </button>
  );
}