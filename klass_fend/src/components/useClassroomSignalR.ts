import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export const useClassroomSignalR = (
    onFocusUpdate: (mode: string) => void,
    onLockUpdate: (isLocked: boolean, focusMode: string) => void
) => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        console.log("📡 SignalR: Initializing connection to:", import.meta.env.VITE_SIGNALR_URL);

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(import.meta.env.VITE_SIGNALR_URL)
            .withAutomaticReconnect()
            // This will log SignalR's internal lifecycle (handshakes, pings) to the console
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // --- LISTENERS ---

        connection.on("ReceiveFocusUpdate", (mode: string) => {
            console.log("%c🎯 SignalR: Received 'ReceiveFocusUpdate'", "color: #007bff; font-weight: bold;", { mode });
            onFocusUpdate(mode);
        });

        connection.on("ReceiveLockUpdate", (data: { isLocked: boolean; focusMode: string }) => {
            console.log("%c🔒 SignalR: Received 'ReceiveLockUpdate'", "color: #ffc107; font-weight: bold;", data);
            onLockUpdate(data.isLocked, data.focusMode);
        });

        // --- LIFECYCLE EVENTS ---

        connection.onreconnecting((error) => {
            console.warn("⚠️ SignalR: Connection lost. Reconnecting...", error);
        });

        connection.onreconnected((connectionId) => {
            console.log("✅ SignalR: Reconnected. Connection ID:", connectionId);
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
            console.log("🔌 SignalR: Component unmounting, stopping connection...");
            connection.stop();
        };
    }, [onFocusUpdate, onLockUpdate]);

    return connectionRef.current;
};