import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

type FocusUpdateHandler = (mode: string) => void;
type LockUpdateHandler = (isLocked: boolean, focusMode: string) => void;

export const useClassroomSignalR = (
    onFocusUpdate: FocusUpdateHandler,
    onLockUpdate: LockUpdateHandler
) => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    // We use refs for the handlers so the useEffect doesn't need to re-run 
    // whenever the parent component re-renders or changes the callback logic.
    const focusUpdateRef = useRef(onFocusUpdate);
    const lockUpdateRef = useRef(onLockUpdate);

    useEffect(() => {
        focusUpdateRef.current = onFocusUpdate;
        lockUpdateRef.current = onLockUpdate;
    }, [onFocusUpdate, onLockUpdate]);

    useEffect(() => {
        // Avoid double initialization in Strict Mode
        if (connectionRef.current) return;

        console.log("📡 SignalR: Initializing connection...");

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(import.meta.env.VITE_SIGNALR_URL)
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
    }, []); // Empty dependency array ensures this only runs once on mount

    return connectionRef.current;
};