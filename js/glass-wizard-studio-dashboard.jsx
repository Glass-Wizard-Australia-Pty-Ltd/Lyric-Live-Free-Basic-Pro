import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wand2,
  Music,
  Camera,
  Mic2,
  Users,
  HeartHandshake,
  Coins,
  ScrollText,
  Sparkles,
  Send,
  QrCode,
  Wallet,
  ShieldCheck,
  Radio,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FIREBASE_FUNCTION_URL = "YOUR_FIREBASE_FUNCTION_URL/glassWizardAI";
const NFT_PREPARE_URL = "/api/nft/prepare";

const tools = [
  {
    title: "AI Photo & Video Suite",
    description: "Create, edit, storyboard, and polish visuals for Glass Wizard campaigns.",
    icon: Camera,
  },
  {
    title: "AI Music Tools",
    description: "Generate lyrics, hooks, release plans, captions, and monetisation flows.",
    icon: Music,
  },
  {
    title: "Voice Cloning Studio",
    description: "Build podcast voiceovers, character lines, and guided workshop audio.",
    icon: Mic2,
  },
  {
    title: "Webspace & Podcast",
    description: "Publish SAMSHAM episodes, blog posts, and community stories.",
    icon: Radio,
  },
  {
    title: "Social Impact Apps",
    description: "Support wellbeing, harm reduction, workshop check-ins, and outback outreach.",
    icon: HeartHandshake,
  },
];

const resources = ["Lifeline Australia", "Beyond Blue", "Crisis Text Line", "Local outreach partners"];

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="rounded-2xl border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-2xl bg-purple-500/20 p-3 text-purple-200">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ToolCard({ tool }) {
  const Icon = tool.icon;
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
      <Card className="h-full rounded-2xl border-white/10 bg-black/35 shadow-xl backdrop-blur">
        <CardContent className="p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">{tool.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GlassWizardStudioDashboard() {
  const [message, setMessage] = useState("Brainstorm a Glass Wizard community workshop idea");
  const [oracleReply, setOracleReply] = useState("The oracle prepares its counsel...");
  const [gwaAmount, setGwaAmount] = useState("");
  const [nftStatus, setNftStatus] = useState("Ready to prepare NFT minting package.");
  const [trackTitle, setTrackTitle] = useState("Glass Wizard Anthem");
  const [xrpAccount, setXrpAccount] = useState("");

  const dashboardSubtitle = useMemo(
    () => "A SAM & SHAN PRODUCTIONS INC. PROJECT · Glass Wizard Australia Pty Ltd",
    []
  );

  async function askOracle() {
    setOracleReply("Consulting the arcane registry...");
    try {
      const res = await fetch(FIREBASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setOracleReply(data.reply || "No oracle response returned.");
    } catch (error) {
      setOracleReply("Connect your Firebase Function URL to activate Glass Wizard AI.");
    }
  }

  async function prepareNft() {
    setNftStatus("Preparing NFT package...");
    try {
      const res = await fetch(NFT_PREPARE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: xrpAccount,
          track: { title: trackTitle, artist: "Glass Wizard Australia" },
          transferFee: 5,
        }),
      });
      const data = await res.json();
      setNftStatus(data.message || "NFT prepare endpoint responded successfully.");
    } catch (error) {
      setNftStatus("Add your /api/nft/prepare backend route to activate NFT preparation.");
    }
  }

  return <div />;
}
