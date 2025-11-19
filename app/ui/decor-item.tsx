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
      className="bg-blue-500/50 w-16 h-16 m-3 flex justify-center"
      onClick={handleOnClick}
    >
      <Image
        src={imageSrc}
        alt="Decoration item"
        width={40} height={40}
      />
    </button>
  );
}