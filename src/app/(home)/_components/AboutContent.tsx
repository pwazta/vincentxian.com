/**
 * About section content component with tabbed layout
 * Used in: Portfolio modal for About section
 * Tabs: About | Experience | Activities
 * Desktop: Vertical tabs on right with separator
 * Mobile: Horizontal tabs below header
 */
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/features/shared/components/ui/tabs";
import { AboutMeContent } from "./aboutPageContents/AboutMeContent";
import { ExperienceContent } from "./aboutPageContents/ExperienceContent";
import { ActivitiesContent } from "./aboutPageContents/ActivitiesContent";

export function AboutContent() {
  const [activeTab, setActiveTab] = React.useState("about");

  return (
    <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Mobile: Horizontal tabs with sliding indicator */}
      <TabsList className="md:hidden w-full flex justify-center gap-1 bg-transparent mb-4 relative">
        <TabsTrigger
          value="about"
          className="px-4 py-2 text-sm rounded-md relative z-10 cursor-pointer hover:bg-accent/20 transition-colors"
        >
          {activeTab === "about" && (
            <motion.div
              layoutId="mobile-active-tab"
              className="absolute inset-0 bg-primary/10 rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">About</span>
        </TabsTrigger>
        <TabsTrigger
          value="experience"
          className="px-4 py-2 text-sm rounded-md relative z-10 cursor-pointer hover:bg-accent/20 transition-colors"
        >
          {activeTab === "experience" && (
            <motion.div
              layoutId="mobile-active-tab"
              className="absolute inset-0 bg-primary/10 rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Experience</span>
        </TabsTrigger>
        <TabsTrigger
          value="activities"
          className="px-4 py-2 text-sm rounded-md relative z-10 cursor-pointer hover:bg-accent/20 transition-colors"
        >
          {activeTab === "activities" && (
            <motion.div
              layoutId="mobile-active-tab"
              className="absolute inset-0 bg-primary/10 rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Activities</span>
        </TabsTrigger>
      </TabsList>

      {/* Desktop: Content + Vertical tabs on right */}
      <div className="flex overflow-hidden">
        {/* Tab content area */}
        <div className="flex-1 min-w-0">
          <TabsContent value="about" className="mt-0">
            <AboutMeContent />
          </TabsContent>
          <TabsContent value="experience" className="mt-0">
            <ExperienceContent />
          </TabsContent>
          <TabsContent value="activities" className="mt-0">
            <ActivitiesContent />
          </TabsContent>
        </div>

        {/* Desktop: Vertical separator + tabs on right with slide-from-top animation */}
        <motion.div
          className="hidden md:flex items-stretch ml-4"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.25
          }}
        >
          {/* Vertical separator */}
          <div className="w-px bg-accent/30 mr-3" />

          {/* Vertical tabs with sliding indicator */}
          <TabsList className="flex flex-col h-full justify-start gap-2 bg-transparent p-0 relative">
            <TabsTrigger
              value="about"
              className="px-2 py-3 text-sm rounded-none rounded-r-md relative z-10 transition-colors cursor-pointer hover:bg-accent/20"
              style={{ writingMode: "vertical-rl" }}
            >
              {activeTab === "about" && (
                <motion.div
                  layoutId="desktop-active-tab"
                  className="absolute inset-0 bg-primary/10 border-l-2 border-primary rounded-none rounded-r-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">About</span>
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="px-2 py-3 text-sm rounded-none rounded-r-md relative z-10 transition-colors cursor-pointer hover:bg-accent/20"
              style={{ writingMode: "vertical-rl" }}
            >
              {activeTab === "experience" && (
                <motion.div
                  layoutId="desktop-active-tab"
                  className="absolute inset-0 bg-primary/10 border-l-2 border-primary rounded-none rounded-r-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Experience</span>
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="px-2 py-3 text-sm rounded-none rounded-r-md relative z-10 transition-colors cursor-pointer hover:bg-accent/20"
              style={{ writingMode: "vertical-rl" }}
            >
              {activeTab === "activities" && (
                <motion.div
                  layoutId="desktop-active-tab"
                  className="absolute inset-0 bg-primary/10 border-l-2 border-primary rounded-none rounded-r-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Activities</span>
            </TabsTrigger>
          </TabsList>
        </motion.div>
      </div>
    </Tabs>
  );
}
