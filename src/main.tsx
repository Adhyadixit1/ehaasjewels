import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/providers/theme-provider";

// Function to initialize the app
function initializeApp() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );
  }
}

// Initialize the app immediately
initializeApp();