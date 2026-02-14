
'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, Check, X, Clock, Send, DollarSign, Truck, PackageCheck, MoreVertical } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type OrderStatus = 'pending' | 'quote-sent' | 'paid' | 'out-for-delivery' | 'delivered' | 'rejected';

type LineItem = {
    id: string;
    description: string;
    quantity: number;
    price: number; // in paise
}

type VoiceOrder = {
    id: string;
    customer: string;
    orderText: string;
    time: string;
    status: OrderStatus;
    lineItems?: LineItem[];
    deliveryCharge?: number; // in paise
    totalAmount?: number; // in paise
}

const initialVoiceOrders: VoiceOrder[] = [
    { id: 'vo-01', customer: 'Ramu K.', orderText: 'One large coffee and two croissants', time: '2 minutes ago', status: 'pending' },
    { id: 'vo-02', customer: 'Bharath G.', orderText: 'Two chicken burgers, no pickles', time: '15 minutes ago', status: 'quote-sent', totalAmount: 55000 },
    { id: 'vo-03', customer: 'Shathrugna M.', orderText: 'A veggie pizza and a coke', time: '1 hour ago', status: 'paid', totalAmount: 85000 },
    { id: 'vo-04', customer: 'Laxman S.', orderText: 'ரெண்டு மசாலா தோசை', time: '3 hours ago', status: 'delivered', totalAmount: 30000 },
    { id: 'vo-05', customer: 'Agent Penelope', orderText: 'Order me something nice', time: '5 hours ago', status: 'rejected' },
]

const StatusInfo = {
    pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
    'quote-sent': { icon: Send, color: 'text-blue-500', label: 'Quote Sent' },
    paid: { icon: DollarSign, color: 'text-green-500', label: 'Paid' },
    'out-for-delivery': { icon: Truck, color: 'text-cyan-500', label: 'Out for Delivery' },
    delivered: { icon: PackageCheck, color: 'text-primary', label: 'Delivered' },
    rejected: { icon: X, color: 'text-red-500', label: 'Rejected' },
}

const QuoteDialog = ({ order, onSendQuote }: { order: VoiceOrder; onSendQuote: (orderId: string, lineItems: LineItem[], deliveryCharge: number) => void; }) => {
    const [lineItems, setLineItems] = React.useState<LineItem[]>([{ id: 'item-1', description: '', quantity: 1, price: 0 }]);
    const [deliveryCharge, setDeliveryCharge] = React.useState(0);
    const { toast } = useToast();

    const handleItemChange = (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
        setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => {
        setLineItems([...lineItems, { id: `item-${Date.now()}`, description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    };
    
    const calculateTotal = () => {
        const itemsTotal = lineItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
        return itemsTotal + Number(deliveryCharge);
    }

    const handleSendQuote = () => {
        if (lineItems.some(item => !item.description || item.price <= 0)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Items',
                description: 'Please ensure all items have a description and price.',
            });
            return;
        }
        onSendQuote(order.id, lineItems, deliveryCharge);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm"><Send className="mr-2 h-4 w-4" />Create & Send Quote</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Quote for Order #{order.id}</DialogTitle>
                    <DialogDescription>Customer Request: "{order.orderText}"</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    {lineItems.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                            <Input placeholder="Item Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="col-span-5" />
                            <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="col-span-2" />
                            <Input type="number" placeholder="Price (₹)" value={item.price} onChange={e => handleItemChange(item.id, 'price', Number(e.target.value))} className="col-span-3" />
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="col-span-2 text-red-500"><X className="h-4 w-4" /></Button>
                        </div>
                    ))}
                     <Button variant="outline" size="sm" onClick={addItem}>Add Item</Button>
                     <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-end items-center gap-4">
                            <Label htmlFor="delivery-charge">Delivery Charge (₹)</Label>
                            <Input id="delivery-charge" type="number" className="w-32" value={deliveryCharge} onChange={e => setDeliveryCharge(Number(e.target.value))} />
                        </div>
                        <div className="flex justify-end items-center gap-4 text-lg font-bold">
                            <span>Total:</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                     </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button onClick={handleSendQuote}><Send className="mr-2 h-4 w-4" />Send Quote to Customer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


const OrderCard = ({ order, onStatusChange, onSendQuote }: { order: VoiceOrder, onStatusChange: (id: string, status: OrderStatus) => void, onSendQuote: (orderId: string, lineItems: LineItem[], deliveryCharge: number) => void; }) => {
    const { toast } = useToast();
    const StatusIcon = StatusInfo[order.status].icon;
    const statusColor = StatusInfo[order.status].color;

    const handleSendQuote = (orderId: string, lineItems: LineItem[], deliveryCharge: number) => {
        onSendQuote(orderId, lineItems, deliveryCharge);
        toast({ title: 'Quote Sent!', description: `Quote for order ${orderId} has been sent to the customer.` });
    }

    return (
        <Card>
            <CardContent className="p-4 flex items-start gap-4">
                <StatusIcon className={`h-6 w-6 mt-1 ${statusColor}`} />
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-lg">"{order.orderText}"</p>
                        <Badge variant={order.status === 'rejected' ? 'destructive' : 'secondary'}>{StatusInfo[order.status].label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">From {order.customer} - {order.time}</p>
                    {order.totalAmount && <p className="font-bold text-lg">Total: ₹{(order.totalAmount / 100).toFixed(2)}</p>}
                    
                    <div className="flex items-center gap-2 pt-2">
                        {order.status === 'pending' && (
                           <>
                             <Button variant="outline" size="sm" onClick={() => onStatusChange(order.id, 'rejected')}><X className="mr-1 h-4 w-4"/> Reject</Button>
                             <QuoteDialog order={order} onSendQuote={handleSendQuote} />
                           </>
                        )}
                        {order.status === 'quote-sent' && <p className="text-sm text-blue-600">Waiting for customer payment...</p>}
                        {order.status === 'paid' && <Button size="sm" onClick={() => onStatusChange(order.id, 'out-for-delivery')}><Truck className="mr-2 h-4 w-4" /> Mark as Out for Delivery</Button>}
                        {order.status === 'out-for-delivery' && <Button size="sm" onClick={() => onStatusChange(order.id, 'delivered')}><PackageCheck className="mr-2 h-4 w-4" /> Mark as Delivered</Button>}
                    </div>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                        {order.status !== 'delivered' && order.status !== 'rejected' && <DropdownMenuItem className="text-red-500" onClick={() => onStatusChange(order.id, 'rejected')}>Cancel Order</DropdownMenuItem>}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    )
}

export default function VoiceOrdersPage() {
    const [orders, setOrders] = React.useState<VoiceOrder[]>(initialVoiceOrders);

    const handleStatusChange = (id: string, status: OrderStatus) => {
        setOrders(orders.map(o => o.id === id ? {...o, status} : o));
    };

    const handleSendQuote = (orderId: string, lineItems: LineItem[], deliveryCharge: number) => {
        const totalAmount = lineItems.reduce((acc, item) => acc + item.quantity * item.price * 100, 0) + deliveryCharge * 100;
        setOrders(orders.map(o => o.id === orderId ? {
            ...o, 
            status: 'quote-sent',
            lineItems,
            deliveryCharge,
            totalAmount,
        } : o));
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Voice Orders" />
        <Card>
        <CardHeader>
          <CardTitle>Manage Voice Orders</CardTitle>
          <CardDescription>Review, quote, and fulfill voice-activated orders from customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-6 border-2 border-dashed rounded-lg flex flex-col items-center text-center">
                 <Mic className="h-12 w-12 text-primary" />
                 <h3 className="text-lg font-semibold mt-2">Listening for new voice orders...</h3>
                 <p className="text-sm text-muted-foreground">New orders will appear here in real-time.</p>
            </div>
            <div className="space-y-3">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onSendQuote={handleSendQuote} />
                ))}
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
