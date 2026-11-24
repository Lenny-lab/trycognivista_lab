"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CognitiveProfileState, KnowledgeCitation } from "@/lib/types";

const STORAGE_KEY_API = "cognivista_deepseek_key";
const STORAGE_KEY_THEME = "cognivista_theme";
const STORAGE_KEY_PROFILE = "cognivista_profile_v1";

const DEFAULT_PROFILE: CognitiveProfileState = {
  exploredDisciplines: {
    哲学: 2,
    经济学: 2,
    计算机科学: 3,
    法学: 1,
    心理学: 1,
    教育学: 1,
  },
  lensCount: 2,
  socraticCount: 1,
  decisionCount: 1,
  rigorHistory: [
    { timestamp: "初始基线", score: 58, topic: "通识课与实习时间分配" },
  ],
};

interface CognitiveContextValue {
  apiKey: string;
  setApiKey: (key: string) => void;
  serverHasEnvKey: boolean;
  isLiveReady: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
  apiKeyModalOpen: boolean;
  setApiKeyModalOpen: (open: boolean) => void;
  drawerOpen: boolean;
  activeCitation: KnowledgeCitation | null;
  sessionCitations: KnowledgeCitation[];
  openCitationDrawer: (citation: KnowledgeCitation, allCitations?: KnowledgeCitation[]) => void;
  closeCitationDrawer: () => void;
  profile: CognitiveProfileState;
  recordExploredDisciplines: (disciplines: string[]) => void;
  recordSocraticAttempt: (score: number, topic: string) => void;
  recordDecisionAttempt: () => void;
}

const CognitiveContext = createContext<CognitiveContextValue | null>(null);

export function CognitiveProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [serverHasEnvKey, setServerHasEnvKey] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<KnowledgeCitation | null>(null);
  const [sessionCitations, setSessionCitations] = useState<KnowledgeCitation[]>([]);
  const [profile, setProfile] = useState<CognitiveProfileState>(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(STORAGE_KEY_API) || "";
      if (savedKey) setApiKeyState(savedKey);

      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as "dark" | "light" | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
        document.documentElement.classList.toggle("light", savedTheme === "light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }

      const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch {
      // ignore storage errors
    }

    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.hasServerEnvKey === "boolean") {
          setServerHasEnvKey(data.hasServerEnvKey);
        }
      })
      .catch(() => {});
  }, []);

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY_API, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY_API);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY_THEME, next);
      } catch {
        // ignore
      }
      document.documentElement.classList.toggle("light", next === "light");
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  const openCitationDrawer = useCallback(
    (citation: KnowledgeCitation, allCitations?: KnowledgeCitation[]) => {
      setActiveCitation(citation);
      if (allCitations && allCitations.length > 0) {
        setSessionCitations(allCitations);
      } else {
        setSessionCitations((prev) => {
          const exists = prev.some((c) => c.chunkId === citation.chunkId);
          return exists ? prev : [citation, ...prev];
        });
      }
      setDrawerOpen(true);
    },
    []
  );

  const closeCitationDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const persistProfile = useCallback((next: CognitiveProfileState) => {
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const recordExploredDisciplines = useCallback(
    (disciplines: string[]) => {
      setProfile((prev) => {
        const nextMap = { ...prev.exploredDisciplines };
        for (const d of disciplines) {
          nextMap[d] = (nextMap[d] || 0) + 1;
        }
        const next: CognitiveProfileState = {
          ...prev,
          exploredDisciplines: nextMap,
          lensCount: prev.lensCount + 1,
        };
        try {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const recordSocraticAttempt = useCallback((score: number, topic: string) => {
    setProfile((prev) => {
      const next: CognitiveProfileState = {
        ...prev,
        socraticCount: prev.socraticCount + 1,
        rigorHistory: [
          ...prev.rigorHistory.slice(-9),
          {
            timestamp: new Date().toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            score,
            topic: topic.slice(0, 18),
          },
        ],
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const recordDecisionAttempt = useCallback(() => {
    setProfile((prev) => {
      const next: CognitiveProfileState = {
        ...prev,
        decisionCount: prev.decisionCount + 1,
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  void persistProfile;

  const isLiveReady = apiKey.length > 8 || serverHasEnvKey;

  return (
    <CognitiveContext.Provider
      value={{
        apiKey,
        setApiKey,
        serverHasEnvKey,
        isLiveReady,
        theme,
        toggleTheme,
        apiKeyModalOpen,
        setApiKeyModalOpen,
        drawerOpen,
        activeCitation,
        sessionCitations,
        openCitationDrawer,
        closeCitationDrawer,
        profile,
        recordExploredDisciplines,
        recordSocraticAttempt,
        recordDecisionAttempt,
      }}
    >
      {children}
    </CognitiveContext.Provider>
  );
}

export function useCognitive() {
  const ctx = useContext(CognitiveContext);
  if (!ctx) {
    throw new Error("useCognitive must be used inside CognitiveProvider");
  }
  return ctx;
}
