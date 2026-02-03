import React, { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { Undo, Redo, Trash2, Circle, Square } from "lucide-react";

export default function Whiteboard() {
  const canvasRef = useRef(null);

  const [brushColor, setBrushColor] = useState("#0ea5e9"); // cyan
  const [brushRadius, setBrushRadius] = useState(4);
  const [bgColor, setBgColor] = useState("transparent");

  const colors = ["#0ea5e9", "#facc15", "#f87171", "#34d399", "#a78bfa", "#ffffff", "#000000"];

  const clearCanvas = () => canvasRef.current.clearCanvas();
  const undo = () => canvasRef.current.undo();
  const redo = () => canvasRef.current.redo();

  return (
    <div className="w-screen h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      
      {/* Header / Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-black/10 dark:border-white/20 bg-white dark:bg-black">
        <h2 className="text-xl font-bold flex-1">Whiteboard</h2>

        {/* Brush Colors */}
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border ${brushColor === color ? "border-black dark:border-white" : "border-white/20"} transition`}
              style={{ backgroundColor: color }}
              onClick={() => setBrushColor(color)}
            />
          ))}
        </div>

        {/* Brush size */}
        <input
          type="range"
          min="1"
          max="20"
          value={brushRadius}
          onChange={(e) => setBrushRadius(parseInt(e.target.value))}
          className="w-24"
        />

        {/* Canvas Actions */}
        <button onClick={undo} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition">
          <Undo />
        </button>
        <button onClick={redo} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition">
          <Redo />
        </button>
        <button onClick={clearCanvas} className="p-2 rounded-lg hover:bg-red-500/20 transition">
          <Trash2 />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={brushRadius}
          strokeColor={brushColor}
          canvasColor={bgColor}
          width="100%"
          height="100%"
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
}
