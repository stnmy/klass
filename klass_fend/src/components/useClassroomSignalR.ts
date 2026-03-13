import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

type FocusUpdateHandler = (mode: string) => void;
type LockUpdateHandler = (isLocked: boolean, focusMode: string) => void;
type HandLoweredHandler = () => void; // Added for hand-lowered notification

export const useClassroomSignalR = (
    onFocusUpdate: FocusUpdateHandler,
    onLockUpdate: LockUpdateHandler,
    onHandLowered: HandLoweredHandler // New parameter
) => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    // Keep refs updated to avoid re-running the main effect
    const focusUpdateRef = useRef(onFocusUpdate);
    const lockUpdateRef = useRef(onLockUpdate);
    const handLoweredRef = useRef(onHandLowered);

    useEffect(() => {
        focusUpdateRef.current = onFocusUpdate;
        lockUpdateRef.current = onLockUpdate;
        handLoweredRef.current = onHandLowered;
    }, [onFocusUpdate, onLockUpdate, onHandLowered]);

    useEffect(() => {
        // Avoid double initialization in Strict Mode
        if (connectionRef.current) return;

        console.log("📡 SignalR: Initializing connection...");

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(import.meta.env.VITE_SIGNALR_URL, {
                // CRITICAL: This allows the backend EmailUserIdProvider to read the JWT
                accessTokenFactory: () => localStorage.getItem("token") || "",
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // --- LISTENERS ---

        connection.on("ReceiveFocusUpdate", (mode: string) => {
            console.log("%c🎯 SignalR: Received Focus Update", "color: #007bff; font-weight: bold;", { mode });
            focusUpdateRef.current(mode);
        });

        connection.on("ReceiveLockUpdate", (data: { isLocked: boolean; focusMode: string }) => {
            console.log("%c🔒 SignalR: Received Lock Update", "color: #ffc107; font-weight: bold;", data);
            lockUpdateRef.current(data.isLocked, data.focusMode);
        });

        // Listener for the targeted notification when a teacher lowers your hand
        connection.on("ReceiveHandLowered", () => {
            console.log("%c✋ SignalR: Your hand was lowered by the teacher", "color: #dc3545; font-weight: bold;");
            handLoweredRef.current();
        });

        // --- LIFECYCLE EVENTS ---

        connection.onreconnecting((error) => {
            console.warn("⚠️ SignalR: Connection lost. Reconnecting...", error);
        });

        connection.onreconnected((connectionId) => {
            console.log("✅ SignalR: Reconnected. ID:", connectionId);
        });

        // --- START ---

        connection.start()
            .then(() => {
                console.log("%c🚀 SignalR: Connected successfully!", "color: #28a745; font-weight: bold;");
            })
            .catch(err => {
                console.error("%c❌ SignalR: Connection failed!", "color: #dc3545; font-weight: bold;", err);
            });

        connectionRef.current = connection;

        return () => {
            if (connectionRef.current) {
                console.log("🔌 SignalR: Stopping connection...");
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, []);

    return connectionRef.current;
};