'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { User } from '@/lib/types';
import { getAdminAgentsPageData } from '@/services/data-service';
import { getUsersClient } from '@/services/user-service.client';
import { AgentList } from './_components/agent-list';
import { Skeleton } from '@/components/ui/skeleton';

function exportToCsv(filename: string, rows: (string | number | Date)[][]) {
  const processRow = (row: (string | number | Date)[]) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      let innerValue = cell === null || cell === undefined ? '' : String(cell);
      if (cell instanceof Date) {
        innerValue = cell.toLocaleString();
      }
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };
  let csvFile = '';
  for (let i = 0; i < rows.length; i++) csvFile += processRow(rows[i]);
  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function AgentsPage() {
  const [agents, setAgents] = React.useState<User[]>([]);
  const [referralCounts, setReferralCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [agentList, allUsers] = await Promise.all([
        getUsersClient('agent'),
        getUsersClient(),
      ]);
      const { agents: a, referralCounts: r } = await getAdminAgentsPageData(agentList, allUsers);
      setAgents(a);
      setReferralCounts(r);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Header pageTitle="Agent Management" />
        <div className="container mx-auto py-4">
          <Card>
            <CardHeader>
              <CardTitle>Agents</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Agent Management" />
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Agents</CardTitle>
                <CardDescription>
                  Manage your agent network. Approve new agents and monitor their performance. Found {agents.length} agents.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AgentList initialAgents={agents} referralCounts={referralCounts} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
