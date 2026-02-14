
/**
 * @file ExtraModulePage
 * @description A placeholder page for a future module or feature in the member's section.
 *
 * @overview
 * This page acts as a template or a placeholder for new features that may be added to the member's application later.
 * It provides a simple, visually appealing "Coming Soon" message to manage user expectations.
 *
 * @features
 * - **Coming Soon UI**: Displays a card with an icon (Rocket), a "Coming Soon!" title, and descriptive text.
 * - **Extensibility**: Can be easily replaced or updated with new page content as the application evolves.
 */

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket } from "lucide-react";

export default function ExtraModulePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Header pageTitle="Extra" />
      <Card>
        <CardHeader>
          <CardTitle>Future Module</CardTitle>
          <CardDescription>This is a placeholder for a future feature.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-16">
          <Rocket className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Coming Soon!</h3>
          <p className="text-muted-foreground">We're working on something exciting. Stay tuned!</p>
        </CardContent>
      </Card>
    </main>
  );
}
