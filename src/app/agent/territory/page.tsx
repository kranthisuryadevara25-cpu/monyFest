
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Users, Building } from "lucide-react";
import { useAuth } from '@/lib/auth';
import { getUserById } from '@/services/user-service';
import { getTerritoryByAgentId } from '@/services/territory-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function TerritoryPage() {
  const { user: authUser } = useAuth();
  const [agentId, setAgentId] = React.useState<string | null>(null);
  const [assignedTerritory, setAssignedTerritory] = React.useState<{ id: string; name: string; pincodes: string[]; assignedAgentId: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    const run = async () => {
      const user = await getUserById(authUser.uid);
      if (user && user.role === 'agent') {
        setAgentId(user.uid);
        const territory = await getTerritoryByAgentId(user.uid);
        setAssignedTerritory(territory);
      }
      setLoading(false);
    };
    run();
  }, [authUser]);

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="My Territory" />
        <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
      </main>
    );
  }
  if (!authUser || !agentId) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="My Territory" />
        <Card><CardContent className="p-6">Agent not found or not approved.</CardContent></Card>
      </main>
    );
  }

  const territoryUsersCount = 0;
  const territoryMerchantsCount = 0;


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="My Territory" />
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Map /> Assigned Territory</CardTitle>
          <CardDescription>Details about your assigned geographic territory and the users within it.</CardDescription>
        </CardHeader>
        <CardContent>
            {assignedTerritory ? (
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>{assignedTerritory.name}</CardTitle>
                             <CardDescription>Pincodes: {assignedTerritory.pincodes.join(', ')}</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Users in Territory</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{territoryUsersCount}</div>
                            <p className="text-xs text-muted-foreground">Potential customers (location-based when available)</p>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Merchants in Territory</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{territoryMerchantsCount}</div>
                             <p className="text-xs text-muted-foreground">Potential businesses to onboard</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                    <Map className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No Territory Assigned</h3>
                    <p className="text-muted-foreground">You have not been assigned a territory yet. Please contact an administrator.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
