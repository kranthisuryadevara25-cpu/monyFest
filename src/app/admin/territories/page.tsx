
'use client'

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MoreHorizontal,
  Trash2,
  PlusCircle,
  Edit
} from 'lucide-react';
import { mockTerritories } from '@/lib/placeholder-data';
import type { User, Territory } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getUsersClient } from '@/services/user-service.client';

const TerritoryFormDialog = ({ 
    agents, 
    onSave, 
    territory,
    children
}: { 
    agents: User[], 
    onSave: (territory: Territory) => void,
    territory?: Territory,
    children: React.ReactNode,
}) => {
    const { toast } = useToast();
    const [name, setName] = React.useState('');
    const [pincodes, setPincodes] = React.useState('');
    const [agentId, setAgentId] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setName(territory?.name || '');
            setPincodes(territory?.pincodes.join(', ') || '');
            setAgentId(territory?.assignedAgentId || '');
        }
    }, [isOpen, territory]);


    const handleSave = () => {
        if (!name || !pincodes || !agentId) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all fields to add a territory.'
            })
            return;
        }

        const newTerritory: Territory = {
            id: territory?.id || `ter-${Date.now()}`,
            name,
            pincodes: pincodes.split(',').map(p => p.trim()),
            assignedAgentId: agentId,
        };
        onSave(newTerritory);
        setIsOpen(false);
    }

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
               {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{territory ? 'Edit Territory' : 'Add New Territory'}</DialogTitle>
                    <DialogDescription>
                        {territory ? `Update the details for ${territory.name}.` : 'Define a new geographic territory and assign it to an agent.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" placeholder="e.g. South Delhi" className="col-span-3" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pincodes" className="text-right">Pincodes</Label>
                        <Input id="pincodes" placeholder="e.g. 110001, 110003" className="col-span-3" value={pincodes} onChange={e => setPincodes(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="agent" className="text-right">Agent</Label>
                            <Select value={agentId} onValueChange={setAgentId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Assign an agent" />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map(agent => (
                                    <SelectItem key={agent.uid} value={agent.uid}>{agent.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleSave}>Save Territory</Button>
                    </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function TerritoriesPage() {
    const { toast } = useToast();
    const [territories, setTerritories] = React.useState(mockTerritories);
    const [availableAgents, setAvailableAgents] = React.useState<User[]>([]);

    React.useEffect(() => {
        getUsersClient('agent').then(setAvailableAgents);
    }, [])

    const handleSaveTerritory = (territory: Territory) => {
        const isEditing = territories.some(t => t.id === territory.id);
        if (isEditing) {
            setTerritories(prev => prev.map(t => t.id === territory.id ? territory : t));
             toast({
                title: 'Territory Updated',
                description: `Successfully updated the ${territory.name} territory.`
            });
        } else {
            setTerritories(prev => [...prev, territory]);
            toast({
                title: 'Territory Added',
                description: `Successfully created the ${territory.name} territory.`
            });
        }
    }
    
    const handleDeleteTerritory = (id: string) => {
        setTerritories(prev => prev.filter(t => t.id !== id));
        toast({
            variant: 'destructive',
            title: 'Territory Deleted',
            description: 'The territory has been removed.'
        });
    }


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Territory Management" />
      <div className="container mx-auto py-4">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Agent Territories</CardTitle>
                        <CardDescription>Create, assign, and manage agent territories.</CardDescription>
                    </div>
                     <TerritoryFormDialog agents={availableAgents} onSave={handleSaveTerritory}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Territory
                        </Button>
                    </TerritoryFormDialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Territory Name</TableHead>
                            <TableHead>Pincodes</TableHead>
                            <TableHead>Assigned Agent</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {territories.map(t => {
                            const agent = availableAgents.find(u => u.uid === t.assignedAgentId);
                            return (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {t.pincodes.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{agent?.name || 'Unassigned'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <TerritoryFormDialog agents={availableAgents} onSave={handleSaveTerritory} territory={t}>
                                                     <button className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                </TerritoryFormDialog>
                                                <DropdownMenuItem>Re-assign Agent</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTerritory(t.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
