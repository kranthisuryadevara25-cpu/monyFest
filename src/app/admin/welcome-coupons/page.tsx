
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
  Gift,
} from 'lucide-react';
import type { WelcomeCoupon, DiscountType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { getWelcomeCoupons, createWelcomeCoupon, updateWelcomeCoupon, deleteWelcomeCoupon } from '@/services/welcome-coupon-service';


const CouponForm = ({ coupon, onSave, onOpenChange }: { coupon?: WelcomeCoupon; onSave: (coupon: WelcomeCoupon, isEditing: boolean) => void; onOpenChange: (open: boolean) => void; }) => {
    const [title, setTitle] = React.useState(coupon?.title || '');
    const [category, setCategory] = React.useState(coupon?.category || '');
    const [discountType, setDiscountType] = React.useState<DiscountType>(coupon?.discountType || 'fixed');
    const [discountValue, setDiscountValue] = React.useState(coupon?.discountValue ? (coupon.discountType === 'fixed' ? coupon.discountValue / 100 : coupon.discountValue) : 0);

    const handleSave = () => {
        const isEditing = !!coupon;
        
        let valueToStore = discountValue;
        if (discountType === 'fixed') {
            valueToStore = discountValue * 100; // Store in paise
        }

        const newCouponData = {
            title,
            category,
            discountType,
            discountValue: valueToStore,
        };

        const newCoupon: WelcomeCoupon = {
            id: coupon?.id || '', // Handled by service for new coupons
            ...newCouponData,
        };

        onSave(newCoupon, isEditing);
        onOpenChange(false);
    }

    return (
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Coupon Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. ₹100 off Groceries" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Groceries" />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="discount-type">Discount Type</Label>
                    <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
                        <SelectTrigger id="discount-type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed (₹)</SelectItem>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">
                        {discountType === 'fixed' ? 'Value (₹)' : 'Value (%)'}
                    </Label>
                    <Input id="value" type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} placeholder={discountType === 'fixed' ? "e.g. 100" : "e.g. 15"} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSave}>Save Coupon</Button>
            </DialogFooter>
        </div>
    )
}

export default function WelcomeCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = React.useState<WelcomeCoupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<WelcomeCoupon | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  const fetchCoupons = React.useCallback(async () => {
    setLoading(true);
    const fetchedCoupons = await getWelcomeCoupons();
    setCoupons(fetchedCoupons);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSave = async (couponData: WelcomeCoupon, isEditing: boolean) => {
    try {
        if (isEditing) {
            await updateWelcomeCoupon(couponData.id, couponData);
            toast({ title: "Coupon Updated", description: `"${couponData.title}" has been updated.` });
        } else {
            await createWelcomeCoupon(couponData);
            toast({ title: "Coupon Created", description: `"${couponData.title}" has been created.` });
        }
        fetchCoupons();
        setIsDialogOpen(false);
        setEditingCoupon(undefined);
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Save failed', description: e.message });
    }
  }

  const handleDelete = async (couponId: string) => {
    try {
        await deleteWelcomeCoupon(couponId);
        fetchCoupons();
        toast({ variant: 'destructive', title: "Coupon Deleted", description: "The welcome coupon has been deleted." });
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Delete failed', description: e.message });
    }
  }

  const getCouponValue = (coupon: WelcomeCoupon) => {
    if (coupon.discountType === 'fixed') {
      return `₹${(coupon.discountValue / 100).toFixed(2)}`;
    }
    return `${coupon.discountValue}%`;
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Welcome Coupons" />
      <div className="container mx-auto py-4">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingCoupon(undefined);
        }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>New Member Signup Coupons</CardTitle>
                    <CardDescription>
                    Manage the default coupons automatically given to new members upon signup.
                    </CardDescription>
                </div>
                <DialogTrigger asChild>
                    <Button onClick={() => setEditingCoupon(undefined)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Coupon
                    </Button>
                </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">Loading coupons...</TableCell>
                    </TableRow>
                ) : coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.title}</TableCell>
                    <TableCell><Badge variant="outline">{coupon.category}</Badge></TableCell>
                    <TableCell>{getCouponValue(coupon)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => { setEditingCoupon(coupon); setIsDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4"/>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(coupon.id)}>
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
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Edit Welcome Coupon' : 'Create New Welcome Coupon'}</DialogTitle>
            </DialogHeader>
            <CouponForm coupon={editingCoupon} onSave={handleSave} onOpenChange={setIsDialogOpen} />
        </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
