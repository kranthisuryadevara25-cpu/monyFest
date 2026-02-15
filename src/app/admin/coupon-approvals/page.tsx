
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
  CheckCircle,
  XCircle,
  Clock,
  PlusCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import type { Offer, Merchant, OfferType, DiscountType } from '@/lib/types';
import { getMerchantsClient } from '@/services/merchant-service.client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getOffers, createOffer, updateOffer, updateOfferStatus, deleteOffer } from '@/services/offer-service';


const OfferForm = ({
  offer,
  merchants,
  onSave,
  onOpenChange
}: {
  offer?: Offer;
  merchants: Merchant[];
  onSave: (offer: Offer) => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const { toast } = useToast();
  const [title, setTitle] = React.useState(offer?.title || '');
  const [description, setDescription] = React.useState(offer?.description || '');
  const [points, setPoints] = React.useState(offer?.points?.toString() || '');
  const [expiryDate, setExpiryDate] = React.useState<Date | undefined>(offer?.expiryDate);
  const [merchantIds, setMerchantIds] = React.useState<string[]>(offer?.merchantIds || []);
  const [offerType, setOfferType] = React.useState<OfferType>(offer?.offerType || 'standard');
  const [includedItems, setIncludedItems] = React.useState(offer?.includedItems || '');
  const [bonusRuleDescription, setBonusRuleDescription] = React.useState(offer?.bonusRuleDescription || '');
  
  const [discountType, setDiscountType] = React.useState<DiscountType>(offer?.discountType || 'fixed');
  const [discountValue, setDiscountValue] = React.useState(offer?.discountValue?.toString() || '');
  const [minimumOrderValue, setMinimumOrderValue] = React.useState(offer?.minimumOrderValue?.toString() || '');
  const [maxDiscountValue, setMaxDiscountValue] = React.useState(offer?.maxDiscountValue?.toString() || '');
  const [loyaltyPoints, setLoyaltyPoints] = React.useState(offer?.loyalty_points?.toString() ?? '10');

  const handleMerchantSelect = (merchantId: string, checked: boolean) => {
    if (checked) {
      setMerchantIds([...merchantIds, merchantId]);
    } else {
      setMerchantIds(merchantIds.filter(id => id !== merchantId));
    }
  }

  const handleSave = () => {
    const selectedMerchants = merchants.filter(m => merchantIds.includes(m.merchantId));
    if (!title || !description || !expiryDate || selectedMerchants.length === 0 || !discountValue) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields including Title, Description, Expiry, Merchants, and Discount Value.'
      })
      return;
    }
    
    const newOffer: Offer = {
      offerId: offer?.offerId || `offer-${Date.now()}`,
      title,
      description,
      points: Number(points) || undefined,
      expiryDate,
      merchantIds: selectedMerchants.map(m => m.merchantId),
      merchantName: selectedMerchants.map(m => m.name).join(', '),
      merchantLogo: selectedMerchants[0]?.logo || '',
      status: offer?.status || 'pending',
      offerType,
      includedItems: offerType === 'combo' ? includedItems : undefined,
      bonusRuleDescription: offerType === 'bonus' ? bonusRuleDescription : undefined,
      discountType: discountType,
      discountValue: Number(discountValue),
      minimumOrderValue: Number(minimumOrderValue) || undefined,
      maxDiscountValue: Number(maxDiscountValue) || undefined,
      loyalty_points: Math.max(0, Math.floor(Number(loyaltyPoints) || 0)) || undefined,
    };
    onSave(newOffer);
    onOpenChange(false);
  };

  return (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
       <div className="space-y-2">
        <Label>Merchants</Label>
        <p className="text-sm text-muted-foreground">Select one or more merchants for this offer.</p>
        <ScrollArea className="h-32 rounded-md border p-2">
            <div className="space-y-2">
            {merchants.map(m => (
                <div key={m.merchantId} className="flex items-center gap-2">
                    <Checkbox
                        id={`merchant-${m.merchantId}`}
                        checked={merchantIds.includes(m.merchantId)}
                        onCheckedChange={(checked) => handleMerchantSelect(m.merchantId, !!checked)}
                    />
                    <Label htmlFor={`merchant-${m.merchantId}`}>{m.name}</Label>
                </div>
            ))}
            </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Offer Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

       <div className="space-y-2">
        <Label htmlFor="offer-type">Offer Type</Label>
        <Select value={offerType} onValueChange={(v) => setOfferType(v as OfferType)}>
          <SelectTrigger id="offer-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard Offer</SelectItem>
            <SelectItem value="combo">Combo Pack</SelectItem>
            <SelectItem value="bonus">Bonus Reward</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {offerType === 'combo' && (
        <div className="space-y-2 p-4 border rounded-md bg-muted/50">
          <Label htmlFor="included-items">Included Items (Combo Pack)</Label>
           <p className="text-xs text-muted-foreground">List items included in the combo, one per line.</p>
          <Textarea id="included-items" placeholder="e.g., 1 Large Coffee\n2 Croissants" value={includedItems} onChange={e => setIncludedItems(e.target.value)} />
        </div>
      )}
      {offerType === 'bonus' && (
         <div className="space-y-2 p-4 border rounded-md bg-muted/50">
          <Label htmlFor="bonus-rule">Bonus Rule Description</Label>
          <p className="text-xs text-muted-foreground">Describe the rule for this bonus. The discount below is the reward.</p>
          <Textarea id="bonus-rule" placeholder="e.g., 'Redeem 5 coupons in 30 days to get this reward.'" value={bonusRuleDescription} onChange={e => setBonusRuleDescription(e.target.value)} />
        </div>
      )}
      
      <Card className="p-4 bg-muted/50">
         <h4 className="mb-4 font-medium">{offerType === 'bonus' ? 'Reward Details' : 'Discount Details'}</h4>
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="discount-type">Discount Type</Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
                <SelectTrigger id="discount-type">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Value (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-value">
                {discountType === 'fixed' ? 'Discount Value (₹)' : 'Discount Percentage (%)'}
              </Label>
              <Input id="discount-value" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
            </div>
        </div>
         <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="min-order-value">Min. Order Value (₹)</Label>
              <Input id="min-order-value" type="number" placeholder="No limit" value={minimumOrderValue} onChange={(e) => setMinimumOrderValue(e.target.value)} />
            </div>
            {discountType === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="max-discount">Max Discount Value (₹)</Label>
                <Input id="max-discount" type="number" placeholder="No limit" value={maxDiscountValue} onChange={(e) => setMaxDiscountValue(e.target.value)} />
              </div>
            )}
        </div>
      </Card>
      
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="points">Points Cost (Optional)</Label>
                <Input id="points" type="number" placeholder="e.g. 50" value={points} onChange={(e) => setPoints(e.target.value)} />
                 <p className="text-xs text-muted-foreground">Leave blank if this is a direct discount.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="loyalty_points">Loyalty Points Earned (per unit)</Label>
                <Input id="loyalty_points" type="number" min={0} placeholder="10" value={loyaltyPoints} onChange={(e) => setLoyaltyPoints(e.target.value)} />
                <p className="text-xs text-muted-foreground">Points the buyer earns per unit when purchasing. Default 10.</p>
            </div>
            <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Popover>
            <PopoverTrigger asChild>
                <Button
                id="expiry"
                variant={'outline'}
                className={cn(
                    'w-full justify-start text-left font-normal',
                    !expiryDate && 'text-muted-foreground'
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus />
            </PopoverContent>
            </Popover>
        </div>
        </div>

      <DialogFooter className="sticky bottom-0 bg-background pt-4">
        <Button onClick={handleSave}>Save Offer</Button>
      </DialogFooter>
    </div>
  );
};


const StatusIcon = ({ status }: { status: Offer['status'] }) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="mr-2 h-4 w-4 text-yellow-500" />;
    case 'rejected':
      return <XCircle className="mr-2 h-4 w-4 text-red-500" />;
    case 'expired':
      return <Clock className="mr-2 h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

const getOfferValue = (offer: Offer) => {
    if (offer.points && offer.points > 0) {
        return `${offer.points} pts`;
    }
    if (offer.discountType === 'fixed') {
        return `₹${offer.discountValue}`;
    }
    if (offer.discountType === 'percentage') {
        let text = `${offer.discountValue}% off`;
        if (offer.maxDiscountValue) {
            text += ` (up to ₹${offer.maxDiscountValue})`;
        }
        return text;
    }
    return 'N/A';
}

export default function CouponApprovalsPage() {
  const { toast } = useToast();
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [merchants, setMerchants] = React.useState<Merchant[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOffer, setEditingOffer] = React.useState<Offer | undefined>(undefined);

  React.useEffect(() => {
    const fetchOffers = async () => {
      const fetchedOffers = await getOffers();
      setOffers(fetchedOffers);
    }
    fetchOffers();
  }, []);

  React.useEffect(() => {
    getMerchantsClient().then(setMerchants);
  }, []);

  const handleStatusChange = async (offerId: string, newStatus: Offer['status']) => {
    try {
      await updateOfferStatus(offerId, newStatus);
      setOffers((prev) =>
        prev.map((o) => (o.offerId === offerId ? { ...o, status: newStatus } : o))
      );
      toast({ title: "Status Updated", description: `Offer status has been changed to ${newStatus}.` });
    } catch (e) {
      toast({ variant: 'destructive', title: "Update Failed", description: e instanceof Error ? e.message : "Could not update offer status." });
    }
  };

  const handleSave = async (offer: Offer) => {
    const isEditing = offers.some(o => o.offerId === offer.offerId);
    try {
      if (isEditing) {
        await updateOffer(offer.offerId, offer);
        setOffers(offers.map(o => o.offerId === offer.offerId ? offer : o));
        toast({ title: "Offer Updated", description: `"${offer.title}" has been updated.` });
      } else {
        const { offerId: _id, ...rest } = offer;
        const newId = await createOffer(rest);
        setOffers([{ ...offer, offerId: newId }, ...offers]);
        toast({ title: "Offer Created", description: `"${offer.title}" has been created.` });
      }
      setIsDialogOpen(false);
      setEditingOffer(undefined);
    } catch (e) {
      toast({ variant: 'destructive', title: "Save Failed", description: e instanceof Error ? e.message : "Could not save offer." });
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      await deleteOffer(offerId);
      setOffers(offers.filter(o => o.offerId !== offerId));
      toast({ variant: 'destructive', title: "Offer Deleted", description: "The offer has been deleted." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Delete Failed", description: e instanceof Error ? e.message : "Could not delete offer." });
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Coupon & Offer Approvals" />
      <div className="container mx-auto py-4">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingOffer(undefined);
        }}>
            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Manage Loyalty Offers</CardTitle>
                    <CardDescription>
                    Review, approve, or reject merchant-submitted offers for loyalty point redemption.
                    </CardDescription>
                </div>
                 <DialogTrigger asChild>
                    <Button onClick={() => setEditingOffer(undefined)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Offer
                    </Button>
                </DialogTrigger>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Offer</TableHead>
                    <TableHead>Merchant(s)</TableHead>
                    <TableHead>Value / Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {offers.map((offer) => (
                    <TableRow key={offer.offerId}>
                        <TableCell className="font-medium">{offer.title}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={offer.merchantLogo}
                                alt={offer.merchantName}
                                data-ai-hint="company logo"
                            />
                            <AvatarFallback>
                                {offer.merchantName.charAt(0)}
                            </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{offer.merchantName}</span>
                        </div>
                        </TableCell>
                        <TableCell>{getOfferValue(offer)}</TableCell>
                        <TableCell>
                        <Badge
                            variant={
                            offer.status === 'active'
                                ? 'secondary'
                                : offer.status === 'pending'
                                ? 'outline'
                                : 'destructive'
                            }
                            className="capitalize"
                        >
                            <StatusIcon status={offer.status} />
                            {offer.status}
                        </Badge>
                        </TableCell>
                        <TableCell>{format(offer.expiryDate, 'PP')}</TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => { setEditingOffer(offer); setIsDialogOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4"/>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {offer.status === 'pending' && (
                                <>
                                <DropdownMenuItem
                                    onClick={() =>
                                    handleStatusChange(offer.offerId, 'active')
                                    }
                                >
                                    Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                    handleStatusChange(offer.offerId, 'rejected')
                                    }
                                >
                                    Reject
                                </DropdownMenuItem>
                                </>
                            )}
                            {offer.status === 'active' && (
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                    handleStatusChange(offer.offerId, 'rejected')
                                    }
                                >
                                    Revoke Approval
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(offer.offerId)}>
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
            <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
            </DialogHeader>
            <OfferForm offer={editingOffer} merchants={merchants} onSave={handleSave} onOpenChange={setIsDialogOpen} />
            </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
