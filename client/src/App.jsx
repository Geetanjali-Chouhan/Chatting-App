import { useEffect } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { getUserProfileThunk } from "./store/slice/user/user.thunk";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getUserProfileThunk());
    })();
  }, [dispatch]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            fontSize: "14px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </>
  );
}

export default App;