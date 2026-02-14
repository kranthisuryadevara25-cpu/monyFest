
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
  Calendar as CalendarIcon,
  Archive,
  BarChart2,
} from 'lucide-react';
import type { BundleOffer } from '@/lib/types';
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
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { getBundleOffers, createBundleOffer, updateBundleOffer, deleteBundleOffer } from '@/services/bundle-offer-service';


const BundleOfferForm = ({ offer, onSave, onOpenChange }: { offer?: BundleOffer; onSave: (offer: BundleOffer, isEditing: boolean) => void; onOpenChange: (open: boolean) => void; }) => {
    const [title, setTitle] = React.useState(offer?.title || '');
    const [description, setDescription] = React.useState(offer?.description || '');
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: offer?.startDate, to: offer?.endDate });
    const [requiredTransactions, setRequiredTransactions] = React.useState(offer?.requiredTransactions?.toString() || '');
    const [rewardType, setRewardType] = React.useState<BundleOffer['rewardType']>(offer?.rewardType || 'cashback');
    const [rewardValue, setRewardValue] = React.useState(offer?.rewardValue?.toString() || '');
    const [usageLimit, setUsageLimit] = React.useState<BundleOffer['usageLimit']>(offer?.usageLimit || 'perUser');
    const [limitValue, setLimitValue] = React.useState(offer?.limitValue?.toString() || '');
    const [status, setStatus] = React.useState<BundleOffer['status']>(offer?.status || 'active');

    const handleSave = () => {
        const isEditing = !!offer;
        const newOffer: Omit<BundleOffer, 'id'> & {id?: string} = {
            id: offer?.id,
            title,
            description,
            startDate: dateRange?.from!,
            endDate: dateRange?.to!,
            requiredTransactions: Number(requiredTransactions),
            rewardType,
            rewardValue: rewardType === 'coupon' ? rewardValue : Number(rewardValue),
            usageLimit,
            limitValue: Number(limitValue),
            status,
        };
        onSave(newOffer as BundleOffer, isEditing);
        onOpenChange(false);
    }

    return (
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Campaign Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label>Campaign Duration</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
             <div className="space-y-2">
                <Label htmlFor="req-tx">Required Transactions</Label>
                <Input id="req-tx" type="number" placeholder="e.g. 5" value={requiredTransactions} onChange={(e) => setRequiredTransactions(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reward-type">Reward Type</Label>
                    <Select value={rewardType} onValueChange={v => setRewardType(v as BundleOffer['rewardType'])}>
                        <SelectTrigger id="reward-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cashback">Cashback (₹)</SelectItem>
                            <SelectItem value="points">Points</SelectItem>
                            <SelectItem value="coupon">Coupon Code</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="reward-value">Reward Value</Label>
                    <Input id="reward-value" placeholder={rewardType === 'coupon' ? 'e.g. WELCOME50' : 'e.g. 100'} value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="usage-limit">Usage Limit Type</Label>
                    <Select value={usageLimit} onValueChange={v => setUsageLimit(v as BundleOffer['usageLimit'])}>
                        <SelectTrigger id="usage-limit"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="perUser">Per User</SelectItem>
                            <SelectItem value="globalLimit">Global Limit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="limit-value">Limit Value</Label>
                    <Input id="limit-value" type="number" placeholder="e.g. 1 for per user" value={limitValue} onChange={(e) => setLimitValue(e.target.value)} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                 <Select value={status} onValueChange={(v) => setStatus(v as BundleOffer['status'])}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button onClick={handleSave}>Save Campaign</Button>
            </DialogFooter>
        </div>
    )
}

export default function BundleOffersPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = React.useState<BundleOffer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOffer, setEditingOffer] = React.useState<BundleOffer | undefined>(undefined);

  const fetchCampaigns = React.useCallback(async () => {
    const fetchedCampaigns = await getBundleOffers();
    setCampaigns(fetchedCampaigns);
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSave = async (offerData: Omit<BundleOffer, 'id'> & {id?: string}, isEditing: boolean) => {
    if (isEditing && offerData.id) {
        await updateBundleOffer(offerData.id, offerData);
        toast({ title: "Campaign Updated", description: `"${offerData.title}" has been updated.` });
    } else {
        await createBundleOffer(offerData);
        toast({ title: "Campaign Created", description: `"${offerData.title}" has been created.` });
    }
    fetchCampaigns(); // Refetch campaigns after saving
    setIsDialogOpen(false);
    setEditingOffer(undefined);
  }

  const handleDelete = async (offerId: string) => {
    await deleteBundleOffer(offerId);
    fetchCampaigns(); // Refetch campaigns after deleting
    toast({ variant: 'destructive', title: "Campaign Deleted", description: "The campaign has been permanently deleted." });
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Bundle Offers & Campaigns" />
      <div className="container mx-auto py-4">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingOffer(undefined);
        }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Campaigns</CardTitle>
                    <CardDescription>
                    Create and manage multi-transaction campaigns.
                    </CardDescription>
                </div>
                <DialogTrigger asChild>
                    <Button onClick={() => setEditingOffer(undefined)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Campaign
                    </Button>
                </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={offer.status === 'active' ? 'secondary' : offer.status === 'inactive' ? 'outline' : 'destructive'}
                        className="capitalize"
                      >
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(offer.startDate, 'PP')} - {format(offer.endDate, 'PP')}</TableCell>
                    <TableCell className="capitalize">
                      {offer.rewardType === 'coupon' ? offer.rewardValue : `${offer.rewardValue} ${offer.rewardType}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => toast({title: 'Coming Soon', description: 'Analytics view is under development.'})}>
                            <BarChart2 className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => { setEditingOffer(offer); setIsDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4"/>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => handleDelete(offer.id)}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-500"/>
                            <span className="text-red-500">Delete</span>
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
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{editingOffer ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
            </DialogHeader>
            <BundleOfferForm offer={editingOffer} onSave={handleSave} onOpenChange={setIsDialogOpen} />
        </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
