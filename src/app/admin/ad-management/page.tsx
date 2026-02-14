
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { mockAdvertisements } from '@/lib/placeholder-data';
import type { Advertisement, AdType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdForm = ({ ad, onSave, onOpenChange }: { ad?: Advertisement; onSave: (ad: Advertisement) => void; onOpenChange: (open: boolean) => void; }) => {
    const [title, setTitle] = React.useState(ad?.title || '');
    const [type, setType] = React.useState<AdType>(ad?.type || 'image');
    const [content, setContent] = React.useState(ad?.content || '');
    const [link, setLink] = React.useState(ad?.link || '');
    const [status, setStatus] = React.useState<'active' | 'inactive'>(ad?.status || 'active');
    const [targetLocation, setTargetLocation] = React.useState(ad?.targetLocation || '');


    const handleSave = () => {
        const newAd: Advertisement = {
            id: ad?.id || `ad-${Date.now()}`,
            title,
            type,
            content,
            link,
            status,
            targetLocation,
            createdAt: ad?.createdAt || new Date(),
        };
        onSave(newAd);
        onOpenChange(false);
    }

    return (
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Ad Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="type">Ad Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AdType)}>
                    <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="scroll">Scrolling Text</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Input id="content" placeholder={type === 'scroll' ? 'Enter scrolling text...' : 'Enter image/video URL...'} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input id="link" placeholder="/member/shop" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="targetLocation">Target Locations</Label>
                <Input id="targetLocation" placeholder="e.g. Mumbai, Warangal, 400050 (comma-separated)" value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)} />
                 <p className="text-xs text-muted-foreground">Leave blank to target all of India.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                 <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button onClick={handleSave}>Save Ad</Button>
            </DialogFooter>
        </div>
    )
}

export default function AdManagementPage() {
  const { toast } = useToast();
  const [ads, setAds] = React.useState<Advertisement[]>(mockAdvertisements);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAd, setEditingAd] = React.useState<Advertisement | undefined>(undefined);

  const handleSave = (ad: Advertisement) => {
    const isEditing = ads.some(a => a.id === ad.id);
    if (isEditing) {
        setAds(ads.map(a => a.id === ad.id ? ad : a));
        toast({ title: "Ad Updated", description: `"${ad.title}" has been updated.` });
    } else {
        setAds([ad, ...ads]);
        toast({ title: "Ad Created", description: `"${ad.title}" has been created.` });
    }
    setIsDialogOpen(false);
    setEditingAd(undefined);
  }

  const handleDelete = (adId: string) => {
    setAds(ads.filter(a => a.id !== adId));
    toast({ variant: 'destructive', title: "Ad Deleted", description: "The advertisement has been deleted." });
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Ad Management" />
      <div className="container mx-auto py-4">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingAd(undefined);
        }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Advertisements</CardTitle>
                    <CardDescription>
                    Create and manage advertisements for the member panel.
                    </CardDescription>
                </div>
                <DialogTrigger asChild>
                    <Button onClick={() => setEditingAd(undefined)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Ad
                    </Button>
                </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target Locations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{ad.type}</Badge></TableCell>
                    <TableCell>{ad.targetLocation || 'Global (All India)'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={ad.status === 'active' ? 'secondary' : 'destructive'}
                        className="capitalize"
                      >
                        {ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(ad.createdAt, 'PP')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => { setEditingAd(ad); setIsDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4"/>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(ad.id)}>
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}</DialogTitle>
            </DialogHeader>
            <AdForm ad={editingAd} onSave={handleSave} onOpenChange={setIsDialogOpen} />
        </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
