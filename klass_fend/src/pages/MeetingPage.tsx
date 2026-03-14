import { useState, useCallback, useMemo } from "react";
import { Monitor } from "lucide-react";
import { useUser } from "../context/userContext";
import { useJitsi } from "../components/ClassManagement/useJitsi";
import { useClassroomSignalR } from "../components/useClassroomSignalR";
import { useMeetingLogic } from "../components/ClassManagement/useMeetingLogic";

import MeetingHeader from "../components/ClassManagement/MeetingHeader";
import NotificationOverlay from "../components/ClassManagement/NotificationOverlay";
import ClassroomSidebar from "../components/ClassManagement/ClassroomSidebar";
import LoadingScreen from "../components/ClassManagement/LoadingScreen";

const MeetingPage = () => {
  // Fixed typo from 'userUser' to 'useUser'
  const { user } = useUser();

  const [layout, setLayout] = useState<"split" | "min-video" | "min-workspace">(
    "split",
  );

  const logic = useMeetingLogic(user, layout, setLayout);
  const jitsi = useJitsi(logic.isTeacher);

  // --- SIGNALR INTEGRATION ---
  useClassroomSignalR(
    // 1. Focus Mode Updates
    useCallback(
      (mode: string) => {
        if (logic.isTeacher) return;
        logic.setClassroomState((prev: any) => ({ ...prev, focusMode: mode }));
        if (logic.classroomState.isLocked) {
          logic.applyFocusMode(mode);
        }
      },
      [
        logic.isTeacher,
        logic.classroomState.isLocked,
        logic.applyFocusMode,
        logic.setClassroomState,
      ],
    ),
    // 2. Lock/UI State Updates
    useCallback(
      (isLocked: boolean, focusMode: string) => {
        if (logic.isTeacher) return;
        logic.setClassroomState((prev: any) => ({
          ...prev,
          focusMode: focusMode,
          isLocked: isLocked,
          isSynced: isLocked,
          isManualLock: isLocked,
        }));

        if (isLocked || focusMode === "default") {
          logic.applyFocusMode(focusMode);
        }
      },
      [logic.isTeacher, logic.applyFocusMode, logic.setClassroomState],
    ),
    // 3. Hand Lowered Notification
    useCallback(() => {
      logic.setIsHandRaised(false);
      if (jitsi.execute) {
        jitsi.execute("toggleRaiseHand", { raised: false });
      }
      if (jitsi.setActiveNotification) {
        jitsi.setActiveNotification({
          type: "hand-raised",
          message: "The teacher has lowered your hand.",
          visible: true,
        });
        setTimeout(() => {
          jitsi.setActiveNotification(null);
        }, 4000);
      }
    }, [logic.setIsHandRaised, jitsi]),
  );

  const isReadyForJitsi = useMemo(() => {
    return !logic.loading && !!logic.roomData && !!logic.jwt;
  }, [logic.loading, logic.roomData, logic.jwt]);

  if (logic.loading) return <LoadingScreen />;

  if (!logic.roomData)
    return (
      <div className="h-screen flex items-center justify-center font-black text-brand-deep bg-white">
        ACCESS DENIED
      </div>
    );

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8F9FA] overflow-hidden">
      {/* HEADER: Layout and SetLayout passed here for the header pill controls */}
      <header className="h-20 w-full flex items-center px-2 z-50 shrink-0">
        <MeetingHeader
          {...logic}
          jitsi={jitsi}
          layout={layout}
          setLayout={setLayout}
        />
      </header>

      {/* MEETING BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        <NotificationOverlay
          activeNotification={jitsi.activeNotification}
          setActiveNotification={jitsi.setActiveNotification}
        />

        {/* Main Workspace Area */}
        <main
          className={`relative flex flex-col transition-all duration-700 ${
            layout === "min-workspace" ? "w-20 p-2" : "flex-1 pr-2"
          }`}
        >
          <div className="flex-1 bg-white rounded-2xl border border-brand-light/10 shadow-sm relative overflow-hidden">
            <div
              className={`h-full w-full flex flex-col items-center justify-center transition-opacity duration-500 ${
                layout === "min-workspace" ? "opacity-0" : "opacity-20"
              } select-none`}
            >
              <Monitor
                size={64}
                strokeWidth={1}
                className="text-brand-deep mb-4"
              />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-deep">
                Interactive Workspace
              </p>
            </div>
          </div>
        </main>

        {/* Jitsi Sidebar Area: layout is used for width logic */}
        {isReadyForJitsi && (
          <ClassroomSidebar
            layout={layout}
            isSharing={jitsi.isSharing}
            jwt={logic.jwt}
            roomData={logic.roomData}
            onApiReady={jitsi.onApiReady}
            isTeacher={logic.isTeacher}
          />
        )}
      </div>
    </div>
  );
};

export default MeetingPage;
