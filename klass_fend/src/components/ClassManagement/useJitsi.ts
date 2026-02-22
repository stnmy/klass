import { useState, useRef, useCallback } from "react";

export const useJitsi = (isTeacher: boolean) => {
    const jitsiApi = useRef<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [isAudioMuted, setIsAudioMuted] = useState(true);
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [activeToast, setActiveToast] = useState<{ name: string; id: string } | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    const [activeNotification, setActiveNotification] = useState<{
        type: "unmute-request" | "muted-by-teacher";
        visible: boolean;
    } | null>(null);

    const updateParticipantList = useCallback(() => {
        if (!jitsiApi.current) return;
        const raw = jitsiApi.current.getParticipantsInfo();
        setParticipants(raw.map((p: any) => ({
            id: p.participantId || p.id,
            displayName: p.displayName || "Student",
            muted: p.muted ?? p.isAudioMuted ?? false,
            isLocal: p.local ?? false,
        })));
    }, []);

    const onApiReady = (api: any) => {
        jitsiApi.current = api;

        api.addListener("videoConferenceJoined", () => {
            setIsAudioMuted(api.isAudioMuted());
            setIsVideoMuted(api.isVideoMuted());
            updateParticipantList();

            if (isTeacher) {
                api.executeCommand("toggleModeration", true, "audio");
                api.executeCommand("toggleModeration", true, "video");
            }
        });

        api.addListener("moderationParticipantApproved", (data: any) => {
            if (!isTeacher && data.mediaType === "audio") {
                setActiveNotification({ type: "unmute-request", visible: true });
            }
        });

        api.addListener("moderationParticipantRejected", (data: any) => {
            if (!isTeacher && data.mediaType === "audio") {
                setActiveNotification({ type: "muted-by-teacher", visible: true });
                setTimeout(() => setActiveNotification(null), 4000);
            }
        });

        api.addListener("audioMuteStatusChanged", (e: any) => {
            const wasUnmuted = !isAudioMuted;
            setIsAudioMuted(e.muted);

            if (e.muted && wasUnmuted && !isTeacher) {
                setActiveNotification((prev) =>
                    prev?.type === "muted-by-teacher" ? prev : { type: "muted-by-teacher", visible: true }
                );
                setTimeout(() => setActiveNotification(null), 4000);
            }

            if (!e.muted) setActiveNotification(null);
            updateParticipantList();
        });

        api.addListener("videoMuteStatusChanged", (e: any) => {
            setIsVideoMuted(e.muted);
        });

        // --- UPDATED HAND RAISED LOGIC USING ID ---
        api.addListener("raiseHandUpdated", (e: any) => {
            const isRaised = e.handRaised > 0;
            const pId = e.id; // Unique Jitsi ID

            // // Update local tracking map immediately
            // setRaisedHandsMap(prev => ({ ...prev, [pId]: isRaised }));

            // 1. Blind the local user to their own hand
            if (pId === api._myID || e.local) {
                setIsHandRaised(false);
            }
            // 2. Teacher sees Toast with the exact ID
            else if (isTeacher && isRaised) {
                const rawParticipants = api.getParticipantsInfo();
                const student = rawParticipants.find((p: any) => (p.participantId || p.id) === pId);

                // Show ID alongside name (or just ID if name is null)
                const identifier = student?.displayName ? `${student.displayName} (${pId})` : `User ID: ${pId}`;

                setActiveToast({ name: identifier, id: pId });
                setTimeout(() => setActiveToast(null), 5000);
            }
            updateParticipantList();
        });

        // Syncs the 'isSharing' state whenever screen sharing is toggled 
        // via external button OR internal Jitsi toolbar
        api.addListener("screenSharingStatusChanged", (e: any) => {
            setIsSharing(e.on);
        });

        api.addListener("participantJoined", updateParticipantList);
        api.addListener("participantLeft", updateParticipantList);
        api.addListener("displayNameChange", updateParticipantList);
    };

    const execute = (cmd: string, ...args: any[]) => jitsiApi.current?.executeCommand(cmd, ...args);

    return {
        onApiReady, participants, isAudioMuted, isVideoMuted,
        isHandRaised, activeToast, isSharing,
        activeNotification, setActiveNotification, execute
    };
};