
/**
 * @file VoiceOrderPage
 * @description A placeholder page for a future voice-activated ordering feature.
 *
 * @overview
 * This page serves as a UI mockup for a feature that would allow members to place orders from merchants
 * using voice commands. It is not currently functional but demonstrates the intended user experience.
 *
 * @features
 * - **Visual Cue**: A large microphone button serves as the primary call to action.
 * - **Informational Text**: Informs the user about supported languages (English, Hindi, Tamil, Telugu, Kannada).
 * - **Example Usage**: Provides an example voice command (e.g., "Order a large coffee from Coffee House.") to guide the user.
 * - **Conceptual**: This page is a visual placeholder and does not contain any business logic for voice recognition or order processing.
 */

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Globe, CircleHelp } from "lucide-react";

export default function VoiceOrderPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Voice Ordering" />
      <Card>
        <CardHeader>
          <CardTitle>Voice-Activated Ordering</CardTitle>
          <CardDescription>Order from your favorite merchants using just your voice.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-6 py-16">
          <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>English, Hindi, Tamil, Telugu & Kannada supported</span>
          </div>
          <Button size="icon" className="h-24 w-24 rounded-full">
              <Mic className="h-10 w-10" />
          </Button>
          <p className="text-muted-foreground">Tap the microphone and start speaking.</p>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
              <CircleHelp className="h-4 w-4" />
              Try saying: "Order a large coffee from Coffee House."
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
