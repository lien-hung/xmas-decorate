import { readdirSync } from "fs";
import MainPage from "@/app/ui/main-page";
import path from "path";

export default function Home() {
  const publicPath = path.normalize("../xmas-decorate/public");
  const itemLinks = readdirSync(path.join(publicPath, "items")).map(file => `/items/${file}`);
  const treeLinks = readdirSync(path.join(publicPath, "trees")).map(file => `/trees/${file}`);

  return (
    <MainPage
      itemLinks={itemLinks}
      treeLinks={treeLinks}
    />
  );
}
