"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/services/auth.service";
import { useRevokeSession } from "@/hooks/auth/useRevokeSession";
import { LuMonitor, LuTrash2, LuLogOut } from "react-icons/lu";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface Session {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
}

export default function SessionsPage() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
  });

  const { revokeSession, isPending: isRevoking } = useRevokeSession();

  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);

  if (isLoading) {
    return <div className="text-lg">Loading sessions...</div>;
  }

  if (!sessions || sessions.length === 0) {
    return <div className="text-lg">No sessions found</div>;
  }

  const handleRevokeSession = () => {
    if (sessionToRevoke) {
      revokeSession(sessionToRevoke, {
        onSuccess: () => {
          setSessionToRevoke(null);
        },
      });
    }
  };

  const handleLogoutAll = () => {
    // Revoke all sessions except the current one
    const currentSessionId = sessions.find((session: Session) =>
      isCurrentSession(session),
    )?.id;
    const otherSessions = sessions.filter(
      (session: Session) => session.id !== currentSessionId,
    );

    // Revoke all other sessions
    otherSessions.forEach((session: Session) => {
      revokeSession(session.id);
    });

    setShowRevokeAllModal(false);
  };

  const isCurrentSession = (session: Session) => {
    // This is a simple heuristic - the most recently active session is likely the current one
    const sortedSessions = [...sessions].sort(
      (a: Session, b: Session) =>
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
    );
    return sortedSessions[0]?.id === session.id;
  };

  const formatUserAgent = (userAgent: string) => {
    // Simple user agent parsing
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Sessions</h1>
        <button
          onClick={() => setShowRevokeAllModal(true)}
          disabled={isRevoking}
          className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50 cursor-pointer"
        >
          <LuLogOut className="h-4 w-4" />
          <span>
            {isRevoking ? "Logging out others..." : "Logout All Other Sessions"}
          </span>
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="divide-y">
          {sessions.map((session: Session) => {
            const isCurrent = isCurrentSession(session);
            return (
              <div
                key={session.id}
                className={`p-4 ${
                  isCurrent ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <LuMonitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {formatUserAgent(session.userAgent)}
                        </p>
                        {isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <p>IP: {session.ip}</p>
                        <p>
                          Created:{" "}
                          {new Date(session.createdAt).toLocaleString()}
                        </p>
                        <p>
                          Last Active:{" "}
                          {new Date(session.lastActiveAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => setSessionToRevoke(session.id)}
                      disabled={isRevoking && sessionToRevoke === session.id}
                      className="flex items-center space-x-2 rounded-lg bg-red-100 px-3 py-2 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 cursor-pointer"
                    >
                      <LuTrash2 className="h-4 w-4" />
                      <span>
                        {isRevoking && sessionToRevoke === session.id
                          ? "Revoking..."
                          : "Revoke"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!sessionToRevoke}
        onClose={() => setSessionToRevoke(null)}
        onConfirm={handleRevokeSession}
        title="Revoke Session"
        description="Are you sure you want to revoke this session? You will be logged out from that device."
        confirmText="Revoke"
        isLoading={isRevoking}
      />

      <ConfirmModal
        isOpen={showRevokeAllModal}
        onClose={() => setShowRevokeAllModal(false)}
        onConfirm={handleLogoutAll}
        title="Revoke All Other Sessions"
        description="Are you sure you want to revoke all other sessions? Your current session will remain active."
        confirmText="Revoke All Others"
        isLoading={isRevoking}
      />
    </div>
  );
}
