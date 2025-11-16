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
    <div key={imageSrc} className="bg-blue-500/50 w-16 h-16 m-4 flex justify-center">
      <Image
        src={imageSrc}
        alt="Decoration item"
        width={40}
        height={40}
        onClick={handleOnClick}
      />
    </div>
  );
}