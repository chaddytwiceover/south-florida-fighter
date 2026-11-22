import { createRoot } from "react-dom/client";
import { GameApp } from "./game/ui/GameApp";
import "./styles.css";

createRoot(document.getElementById("app")!).render(<GameApp />);
