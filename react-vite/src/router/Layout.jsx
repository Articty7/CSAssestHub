import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ModalProvider, Modal } from "../context/Modal";
import { thunkAuthenticate } from "../redux/session";
import Navigation from "../components/Navigation/Navigation";

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await dispatch(thunkAuthenticate());
      } catch (e) {
        // swallow 401s or other errors so the UI still renders
        // console.debug("auth check failed (ok in dev):", e);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [dispatch]);

  return (
    <ModalProvider>
      <Navigation />
      {isLoaded ? <Outlet /> : <div style={{padding:16}}>Loading…</div>}
      <Modal />
    </ModalProvider>
  );
}
