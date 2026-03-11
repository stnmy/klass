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

  /**
   * APPLY FOCUS MODE:
   * This bridges the hook to the UI 'layout' state.
   */
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

  /**
   * INITIAL FETCH
   */
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
          // Only auto-apply if locked and student
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

  /**
   * MASTER TOGGLE (Header Switch)
   * ADDED: forcedLockedState parameter to support the Reset-on-Unlock logic 
   * while keeping all existing state updates exactly as they were.
   */
  const handleToggleLock = async (
    nextManualStatus: boolean,
    currentMode: string,
    forcedLockedState?: boolean // NEW: Allows Header to force "Reset" behavior
  ) => {
    // If forcedLockedState is provided (false), it overrides the toggle status.
    // Otherwise, it defaults to the toggle status (nextManualStatus).
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

  /**
   * ARROW CLICK SYNC
   */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isTeacher) {
      const newMode = getModeFromLayout(layout);

      // Update local state so header label stays correct
      setClassroomState(prev => {
        if (prev.focusMode === newMode) return prev;
        return { ...prev, focusMode: newMode };
      });

      // Broadcast if currently locked
      if (classroomState.isLocked && classroomState.isSynced) {
        api.post("/class/sync-layout", {
          focusMode: newMode,
          isLocked: true,
          isSynced: true,
          isManualLock: true
        }).catch(err => console.error("Arrow sync broadcast failed", err));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  };
};