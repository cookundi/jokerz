import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ToastContainer } from "./components/Toast";
import { Home } from "./pages/Home";
import { Apply } from "./pages/Apply";
import { Check } from "./pages/Check";
import { useToast } from "./hooks/useToast";

export default function App() {
  const { toasts, toast, dismiss } = useToast();

  return (
    <>
      <Navbar />
      <ToastContainer toasts={toasts} dismiss={dismiss} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Apply toast={toast} />} />
        <Route path="/check" element={<Check toast={toast} />} />
      </Routes>
    </>
  );
}
