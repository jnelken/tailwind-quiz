export interface QuizQuestion {
  id: number;
  tailwindClass: string;
  css: { [key: string]: string };
}

export const quizData: QuizQuestion[] = [
  // Display & Layout
  { id: 1, tailwindClass: "flex", css: { display: "flex" } },
  { id: 2, tailwindClass: "grid", css: { display: "grid" } },
  { id: 3, tailwindClass: "hidden", css: { display: "none" } },
  { id: 4, tailwindClass: "block", css: { display: "block" } },
  { id: 5, tailwindClass: "inline", css: { display: "inline" } },
  { id: 6, tailwindClass: "inline-block", css: { display: "inline-block" } },

  // Flexbox
  { id: 7, tailwindClass: "flex-col", css: { "flex-direction": "column" } },
  { id: 8, tailwindClass: "flex-row", css: { "flex-direction": "row" } },
  { id: 9, tailwindClass: "justify-center", css: { "justify-content": "center" } },
  { id: 10, tailwindClass: "justify-between", css: { "justify-content": "space-between" } },
  { id: 11, tailwindClass: "items-center", css: { "align-items": "center" } },
  { id: 12, tailwindClass: "items-start", css: { "align-items": "flex-start" } },
  { id: 13, tailwindClass: "gap-4", css: { gap: "1rem" } },
  { id: 14, tailwindClass: "flex-wrap", css: { "flex-wrap": "wrap" } },

  // Spacing
  { id: 15, tailwindClass: "p-4", css: { padding: "1rem" } },
  { id: 16, tailwindClass: "px-6", css: { "padding-left": "1.5rem", "padding-right": "1.5rem" } },
  { id: 17, tailwindClass: "py-2", css: { "padding-top": "0.5rem", "padding-bottom": "0.5rem" } },
  { id: 18, tailwindClass: "m-4", css: { margin: "1rem" } },
  { id: 19, tailwindClass: "mx-auto", css: { "margin-left": "auto", "margin-right": "auto" } },
  { id: 20, tailwindClass: "mt-8", css: { "margin-top": "2rem" } },

  // Sizing
  { id: 21, tailwindClass: "w-full", css: { width: "100%" } },
  { id: 22, tailwindClass: "h-screen", css: { height: "100vh" } },
  { id: 23, tailwindClass: "max-w-md", css: { "max-width": "28rem" } },
  { id: 24, tailwindClass: "min-h-screen", css: { "min-height": "100vh" } },

  // Typography
  { id: 25, tailwindClass: "text-center", css: { "text-align": "center" } },
  { id: 26, tailwindClass: "text-xl", css: { "font-size": "1.25rem", "line-height": "1.75rem" } },
  { id: 27, tailwindClass: "font-bold", css: { "font-weight": "700" } },
  { id: 28, tailwindClass: "text-gray-500", css: { color: "rgb(107 114 128)" } },
  { id: 29, tailwindClass: "uppercase", css: { "text-transform": "uppercase" } },

  // Background & Borders
  { id: 30, tailwindClass: "bg-blue-500", css: { "background-color": "rgb(59 130 246)" } },
  { id: 31, tailwindClass: "rounded-lg", css: { "border-radius": "0.5rem" } },
  { id: 32, tailwindClass: "border-2", css: { "border-width": "2px" } },
  { id: 33, tailwindClass: "shadow-md", css: { "box-shadow": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" } },

  // Position
  { id: 34, tailwindClass: "relative", css: { position: "relative" } },
  { id: 35, tailwindClass: "absolute", css: { position: "absolute" } },
  { id: 36, tailwindClass: "fixed", css: { position: "fixed" } },
  { id: 37, tailwindClass: "top-0", css: { top: "0px" } },
  { id: 38, tailwindClass: "right-4", css: { right: "1rem" } },

  // Effects
  { id: 39, tailwindClass: "opacity-50", css: { opacity: "0.5" } },
  { id: 40, tailwindClass: "cursor-pointer", css: { cursor: "pointer" } },
  { id: 41, tailwindClass: "overflow-hidden", css: { overflow: "hidden" } },
  { id: 42, tailwindClass: "z-10", css: { "z-index": "10" } },
]
