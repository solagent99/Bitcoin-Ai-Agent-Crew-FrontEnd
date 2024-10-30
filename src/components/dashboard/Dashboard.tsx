"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { CrewManagement } from "@/components/crews/CrewManagement";
import { CloneTradingAnalyzer } from "@/components/crews/CloneTradingAnalyzer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import DashboardChat from "./DashboardChat";

interface Crew {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function Component() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [hasClonedAnalyzer, setHasClonedAnalyzer] = useState(false);
  const router = useRouter();

  const fetchCrews = useCallback(async () => {
    const { data, error } = await supabase
      .from("crews")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching crews:", error);
      return;
    }

    setCrews(data);
  }, []);

  const checkClonedAnalyzer = useCallback(async () => {
    if (hasClonedAnalyzer) return;

    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) return;

    const { data, error } = await supabase
      .from("crews")
      .select("name")
      .eq("profile_id", profile.user.id)
      .eq("name", "TradingAnalyzer")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking for cloned analyzer:", error);
      return;
    }

    setHasClonedAnalyzer(!!data);
  }, [hasClonedAnalyzer]);

  useEffect(() => {
    const initializeDashboard = async () => {
      await fetchCrews();
      await checkClonedAnalyzer();
    };

    initializeDashboard();
  }, [fetchCrews, checkClonedAnalyzer]);

  const handleCrewSelect = useCallback(
    (crew: Crew) => {
      router.push(`/crew/${crew.id}`);
    },
    [router]
  );

  const handleCloneComplete = useCallback(() => {
    setHasClonedAnalyzer(true);
    fetchCrews();
  }, [fetchCrews]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chat with your Crews</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardChat />
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardContent className="mt-4">
          {crews.length > 0 ? (
            <CrewManagement
              crews={crews}
              onCrewSelect={handleCrewSelect}
              onCrewUpdate={fetchCrews}
            />
          ) : (
            <p className="text-muted-foreground">
              You haven&apos;t created any crews yet.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <CloneTradingAnalyzer onCloneComplete={handleCloneComplete} />
        </CardFooter>
      </Card>
    </div>
  );
}
