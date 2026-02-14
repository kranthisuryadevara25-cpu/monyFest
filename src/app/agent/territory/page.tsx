
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Users, Building } from "lucide-react";
import { mockUsers, mockMerchants, mockTerritories } from '@/lib/placeholder-data';

export default function TerritoryPage() {
  const agent = mockUsers.find(u => u.uid === 'laxman-agent-02');
  if (!agent) {
    return <div>Agent not found or not approved.</div>;
  }
  
  const assignedTerritory = mockTerritories.find(t => t.assignedAgentId === agent.uid);
  // This is dummy logic and will need to be replaced with a real location-based query
  const territoryUsers = assignedTerritory ? mockUsers.filter(u => u.role === 'member').slice(0, 5) : [];
  const territoryMerchants = assignedTerritory ? mockMerchants.slice(0, 2) : [];


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
                            <div className="text-2xl font-bold">{territoryUsers.length}</div>
                            <p className="text-xs text-muted-foreground">Potential customers to engage</p>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Merchants in Territory</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{territoryMerchants.length}</div>
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
