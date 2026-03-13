import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/axios";

export const useMeetingLogic = (
  user: any,
  layout: string,
  setLayout: (l: any) => void,
) => {
  const [roomData, setRoomData] = useState<any>(null);
  const [jwt, setJwt] = useState("");
  const [loading, setLoading] = useState(true);

  const [isSyncingLock, setIsSyncingLock] = useState(false);

  // NEW: Track hand state locally to keep the button in sync
  const [isHandRaised, setIsHandRaised] = useState(false);

  const [classroomState, setClassroomState] = useState({
    focusMode: "default",
    isLocked: false,
    isSynced: false,
    isManualLock: false,
  });

  const isInitialMount = useRef(true);
  const isTeacher = user?.role?.toLowerCase() === "teacher";

  const getModeFromLayout = useCallback((currentLayout: string) => {
    if (currentLayout === "min-workspace") return "jitsi";
    if (currentLayout === "min-video") return "class";
    return "default";
  }, []);

  const applyFocusMode = useCallback(
    (mode: string) => {
      if (!mode) return;
      const m = mode.toLowerCase();
      console.log(`%c🛠️ Logic: Applying Focus Mode -> ${m}`, "color: #8b5cf6; font-weight: bold;");

      if (m === "jitsi") setLayout("min-workspace");
      else if (m === "class") setLayout("min-video");
      else setLayout("split");
    },
    [setLayout],
  );

  useEffect(() => {
    (async () => {
      try {
        const [accessRes, stateRes] = await Promise.all([
          api.get("/user/GetClassroomAccess"),
          api.get("/class/state"),
        ]);

        if (accessRes.status === 200) {
          setJwt(accessRes.data.token);
          setRoomData(accessRes.data);
        }

        if (stateRes.status === 200) {
          setClassroomState(stateRes.data);
          if (stateRes.data.isLocked && !isTeacher) {
            applyFocusMode(stateRes.data.focusMode);
          }
        }
      } catch (err) {
        console.error("Initialization failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isTeacher, applyFocusMode]);

  const handleToggleLock = async (
    nextManualStatus: boolean,
    currentMode: string,
    forcedLockedState?: boolean
  ) => {
    const finalLockedState = forcedLockedState !== undefined ? forcedLockedState : nextManualStatus;

    setClassroomState((prev) => ({
      ...prev,
      isLocked: finalLockedState,
      isSynced: nextManualStatus,
      isManualLock: nextManualStatus,
      focusMode: currentMode,
    }));

    setIsSyncingLock(true);
    try {
      await api.post("/class/sync-layout", {
        focusMode: currentMode,
        isLocked: finalLockedState,
        isSynced: nextManualStatus,
        isManualLock: nextManualStatus
      });
    } catch (err) {
      console.error("Master toggle failed", err);
    } finally {
      setIsSyncingLock(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isTeacher) {
      const newMode = getModeFromLayout(layout);

      setClassroomState(prev => {
        if (prev.focusMode === newMode) return prev;
        return { ...prev, focusMode: newMode };
      });

      if (classroomState.isLocked && classroomState.isSynced) {
        api.post("/class/sync-layout", {
          focusMode: newMode,
          isLocked: true,
          isSynced: true,
          isManualLock: true
        }).catch(err => console.error("Arrow sync broadcast failed", err));
      }
    }
  }, [layout, isTeacher]);

  return {
    roomData,
    jwt,
    loading,
    isSyncingLock,
    classroomState,
    setClassroomState,
    handleToggleLock,
    applyFocusMode,
    isTeacher,
    // NEW EXPORTS
    isHandRaised,
    setIsHandRaised,
  };
};