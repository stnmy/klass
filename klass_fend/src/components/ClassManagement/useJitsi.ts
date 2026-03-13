import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useJitsi = (isTeacher: boolean) => {
    const navigate = useNavigate();
    const jitsiApi = useRef<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [isAudioMuted, setIsAudioMuted] = useState(true);
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isStrictMode, setIsStrictMode] = useState(false);

    const [activeToast, setActiveToast] = useState<{ name: string; id: string } | null>(null);
    const [raisedHands, setRaisedHands] = useState<string[]>([]);

    // Updated type definition to include 'hand-raised'
    const [activeNotification, setActiveNotification] = useState<{
        // Add "hand-lowered" to the union type below
        type: "unmute-request" | "muted-by-teacher" | "hand-raised" | "hand-lowered";
        message?: string;
        visible: boolean;
    } | null>(null);

    const updateParticipantList = useCallback(() => {
        if (!jitsiApi.current) return;
        const raw = jitsiApi.current.getParticipantsInfo();
        setParticipants(
            raw.map((p: any) => ({
                id: p.participantId || p.id,
                displayName: p.displayName || "Student",
                muted: p.muted ?? p.isAudioMuted ?? false,
                isLocal: p.local ?? false,
            }))
        );
    }, []);

    const toggleStrictMode = useCallback(
        (enabled: boolean) => {
            if (!jitsiApi.current || !isTeacher) return;
            setIsStrictMode(enabled);
            jitsiApi.current.executeCommand("toggleModeration", enabled, "audio");
            jitsiApi.current.executeCommand("toggleModeration", enabled, "video");
        },
        [isTeacher]
    );

    const onApiReady = (api: any) => {
        jitsiApi.current = api;

        // --- EXIT LOGIC ---
        api.addListener("videoConferenceLeft", () => {
            navigate("/dashboard");
        });

        api.addListener("videoConferenceJoined", () => {
            setIsAudioMuted(api.isAudioMuted());
            setIsVideoMuted(api.isVideoMuted());
            updateParticipantList();
        });

        // --- MODERATION LOGIC ---
        api.addListener("moderationStatusChanged", (data: any) => {
            if (data.mediaType === "audio") {
                setIsStrictMode(data.enabled);

                if (!isTeacher && data.enabled) {
                    setIsAudioMuted(true);
                    setActiveNotification({
                        type: "muted-by-teacher",
                        visible: true,
                        message: "The teacher has muted the class.",
                    });
                    setTimeout(() => setActiveNotification(null), 4000);
                }
            }
        });

        api.addListener("moderationParticipantApproved", (data: any) => {
            if (!isTeacher && data.mediaType === "audio") {
                setActiveNotification({
                    type: "unmute-request",
                    visible: true,
                    message: "The teacher has requested you to unmute.",
                });
            }
        });

        api.addListener("moderationParticipantRejected", (data: any) => {
            if (!isTeacher && data.mediaType === "audio") {
                setActiveNotification({
                    type: "muted-by-teacher",
                    visible: true,
                    message: "Your unmute request was declined.",
                });
                setTimeout(() => setActiveNotification(null), 4000);
            }
        });

        // --- UI SYNC LOGIC ---
        api.addListener("audioMuteStatusChanged", (e: any) => {
            setIsAudioMuted(e.muted);
            updateParticipantList();
        });

        api.addListener("videoMuteStatusChanged", (e: any) => {
            setIsVideoMuted(e.muted);
        });

        api.addListener("raiseHandUpdated", (e: any) => {
            const isRaised = e.handRaised > 0;
            const pId = e.id;
            const isMe = pId === api._myID || e.local === true;

            if (isMe) {
                setIsHandRaised(isRaised);
            } else if (isTeacher) {
                if (isRaised) {
                    setRaisedHands((prev) => Array.from(new Set([...prev, pId])));

                    const rawParticipants = api.getParticipantsInfo();
                    const student = rawParticipants.find(
                        (p: any) => (p.participantId || p.id) === pId
                    );
                    const name = student?.displayName || "Student";

                    // INTEGRATION FIX: Trigger notification for the teacher
                    setActiveNotification({
                        type: "hand-raised",
                        message: `${name} raised their hand`,
                        visible: true,
                    });

                    // Maintain the toast state just in case other components use it
                    setActiveToast({ name, id: pId });

                    // Auto-clear hand raise notification after 5 seconds
                    setTimeout(() => {
                        setActiveNotification((prev) =>
                            prev?.type === "hand-raised" ? null : prev
                        );
                        setActiveToast(null);
                    }, 5000);

                } else {
                    setRaisedHands((prev) => prev.filter((id) => id !== pId));
                    // If hand lowered, clear notification if it's currently showing that student
                    setActiveNotification((prev) =>
                        prev?.type === "hand-raised" ? null : prev
                    );
                }
            }
            updateParticipantList();
        });

        api.addListener("screenSharingStatusChanged", (e: any) => {
            setIsSharing(e.on);
        });

        api.addListener("participantJoined", updateParticipantList);
        api.addListener("participantLeft", (e: any) => {
            setRaisedHands((prev) => prev.filter((id) => id !== e.id));
            updateParticipantList();
        });
        api.addListener("displayNameChange", updateParticipantList);
    };

    const execute = (cmd: string, ...args: any[]) => {
        jitsiApi.current?.executeCommand(cmd, ...args);
    };

    return {
        onApiReady,
        participants,
        isAudioMuted,
        isVideoMuted,
        isHandRaised,
        activeToast,
        isSharing,
        isStrictMode,
        toggleStrictMode,
        activeNotification,
        setActiveNotification,
        execute,
        raisedHands,
        setRaisedHands,
    };
};