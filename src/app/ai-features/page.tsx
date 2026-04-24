"use client";

import { Sparkles, MessageCircle, ListChecks } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container } from "@/components/shared/container";
import { TripGenerator } from "@/components/ai/trip-generator";
import { PackingListGenerator } from "@/components/ai/packing-list";

export default function AiFeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              AI-Powered Travel Tools
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Plan smarter with AI. Generate custom itineraries, get instant
              travel advice, and never forget to pack an essential again.
            </p>
          </div>
        </Container>
      </section>

      {/* Tools */}
      <section className="py-12 lg:py-16">
        <Container>
          <Tabs defaultValue="trip-generator" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-10">
              <TabsTrigger value="trip-generator" className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Trip Generator</span>
                <span className="sm:hidden">Generator</span>
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">AI Chatbot</span>
                <span className="sm:hidden">Chatbot</span>
              </TabsTrigger>
              <TabsTrigger value="packing" className="gap-1.5">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Packing List</span>
                <span className="sm:hidden">Packing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trip-generator">
              <TripGenerator />
            </TabsContent>

            <TabsContent value="chatbot">
              <div className="mx-auto max-w-2xl text-center py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Pally AI Chatbot</h2>
                <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                  Your AI travel assistant is always available! Click the blue
                  chat bubble in the bottom-right corner of any page to start a
                  conversation.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  <div className="rounded-xl border p-4 text-left">
                    <p className="text-sm font-medium">Destination Info</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ask about any destination worldwide
                    </p>
                  </div>
                  <div className="rounded-xl border p-4 text-left">
                    <p className="text-sm font-medium">Visa Requirements</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Check visa needs for your passport
                    </p>
                  </div>
                  <div className="rounded-xl border p-4 text-left">
                    <p className="text-sm font-medium">Packing Tips</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Get smart packing advice
                    </p>
                  </div>
                  <div className="rounded-xl border p-4 text-left">
                    <p className="text-sm font-medium">Budget Planning</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Plan your travel budget wisely
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packing">
              <PackingListGenerator />
            </TabsContent>
          </Tabs>
        </Container>
      </section>
    </>
  );
}
