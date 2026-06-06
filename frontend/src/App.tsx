import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        richColors
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#0B1F45",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
          },
        }}
      />;
    </>
  )
}

export default App;