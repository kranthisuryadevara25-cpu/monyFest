

'use client';
import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Lightbulb, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const initialRecommendations = [
    {
        id: 'rec-01',
        title: 'Launch a "Happy Hour" Offer',
        description: "Your sales data shows a dip between 3 PM and 6 PM on weekdays. Creating a '2-for-1' offer during these hours could boost traffic and sales.",
        icon: Lightbulb,
        category: "Offer Strategy"
    },
    {
        id: 'rec-02',
        title: 'Target Repeat Customers',
        description: "You have 58 customers who have visited more than 5 times in the last month. Create a special 'VIP' offer for them to increase loyalty and encourage higher spending.",
        icon: TrendingUp,
        category: "Customer Engagement"
    },
    {
        id: 'rec-03',
        title: 'Bundle Popular Items',
        description: "Our analysis indicates that 'Cold Coffee' and 'Croissants' are frequently purchased together. Consider creating a combo offer to increase the average order value.",
        icon: Sparkles,
        category: "Product Mix"
    }
]

const newRecommendation = {
    id: 'rec-04',
    title: 'Introduce a Loyalty Points Multiplier',
    description: "To boost weekend sales, offer 2x loyalty points on all purchases made on Saturdays and Sundays. This incentivizes weekend visits and increases point accumulation, leading to faster reward redemption.",
    icon: Sparkles,
    category: "Loyalty Program"
};

export default function AiRecommendationsPage() {
    const { toast } = useToast();
    const [recommendations, setRecommendations] = React.useState(initialRecommendations);
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate API call to fetch a new recommendation
        setTimeout(() => {
            if (recommendations.length < 4) {
                setRecommendations(prev => [...prev, newRecommendation]);
                 toast({
                    title: 'New Insight Generated!',
                    description: 'A new AI recommendation has been added.',
                });
            } else {
                 toast({
                    title: 'No New Insights',
                    description: 'You have all the latest recommendations.',
                });
            }
            setIsGenerating(false);
        }, 1500);
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="AI Recommendations" />
       <Card>
        <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle>AI-Powered Insights</CardTitle>
                    <CardDescription>Get AI-powered recommendations to grow your business, based on your sales and customer data.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <BrainCircuit className="mr-2 h-4 w-4" />
                    )}
                    Generate New Insights
                </Button>
            </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {recommendations.map(rec => (
             <Card key={rec.id} className="flex flex-col">
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                           <rec.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-semibold">{rec.category}</p>
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button className="w-full">Implement Suggestion</Button>
                </div>
            </Card>
           ))}
        </CardContent>
      </Card>
    </main>
  );
}
