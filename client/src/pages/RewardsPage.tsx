import { useEffect, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Trophy, Gift, ArrowRight, Crown, Medal, Award } from "lucide-react";
import { fetchMyRewards, fetchLeaderboard, redeemReward, fetchRedemptions } from "../api/rewardApi";
import { useAuth } from "../hooks/useAuth";

const REWARD_OPTIONS = [
  { type: "DISCOUNT_CODE", label: "10% Discount Code", points: 100, icon: "🏷️", desc: "Get 10% off eco-friendly products" },
  { type: "ECO_CREDIT", label: "Eco Credit ($5)", points: 200, icon: "🌱", desc: "Apply $5 credit to your account" },
  { type: "GIFT_CARD", label: "Gift Card ($10)", points: 500, icon: "🎁", desc: "Redeemable at partner stores" },
  { type: "TREE_PLANT", label: "Plant a Tree", points: 300, icon: "🌳", desc: "We plant a tree in your name" }
];

export function RewardsPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [tab, setTab] = useState<"earn" | "redeem" | "leaderboard">("earn");

  useEffect(() => { void loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [rewardData, lbData, redData] = await Promise.all([
        fetchMyRewards(), fetchLeaderboard(), fetchRedemptions()
      ]);
      setBalance(rewardData.balance);
      setRewards(rewardData.rewards);
      setLeaderboard(lbData.leaderboard);
      setRedemptions(redData.redemptions);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleRedeem(type: string, points: number, desc: string) {
    setRedeeming(type);
    try {
      await redeemReward({ pointsToSpend: points, rewardType: type, description: desc });
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || "Failed to redeem");
    } finally { setRedeeming(null); }
  }

  const rankIcons = [<Crown className="h-5 w-5 text-yellow-500" />, <Medal className="h-5 w-5 text-gray-400" />, <Award className="h-5 w-5 text-amber-600" />];

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        <div className="flex-1 space-y-6">
          <Breadcrumb />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
          </div>

          {/* Balance Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Balance</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-7 w-7 fill-yellow-400 text-yellow-500" />
                  <span className="text-4xl font-black text-foreground">{loading ? "..." : balance}</span>
                  <span className="text-lg font-medium text-muted-foreground">points</span>
                </div>
              </div>
              <div className="hidden sm:flex gap-4 text-center">
                <div><p className="text-2xl font-bold text-primary">{rewards.length}</p><p className="text-xs text-muted-foreground">Earned</p></div>
                <div className="w-px bg-border" />
                <div><p className="text-2xl font-bold text-emerald-500">{redemptions.length}</p><p className="text-xs text-muted-foreground">Redeemed</p></div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
            {[{key: "earn", label: "Earning History"}, {key: "redeem", label: "Redeem Rewards"}, {key: "leaderboard", label: "Leaderboard"}].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground p-4"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
          ) : (
            <>
              {/* Earning History Tab */}
              {tab === "earn" && (
                <Card className="border-none shadow-sm"><CardContent className="p-0">
                  {rewards.length === 0 ? (
                    <p className="p-6 text-center text-muted-foreground">No rewards earned yet. Start recycling to earn points!</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {rewards.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                          <div>
                            <p className="font-medium text-sm">{r.reason}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                          </div>
                          <span className="font-bold text-emerald-500">+{r.points}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent></Card>
              )}

              {/* Redeem Tab */}
              {tab === "redeem" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REWARD_OPTIONS.map(opt => (
                    <Card key={opt.type} className={`border-none shadow-sm transition-all hover:shadow-md ${balance < opt.points ? 'opacity-60' : ''}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{opt.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{opt.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                <Star className="h-4 w-4 fill-yellow-400" /> {opt.points} pts
                              </span>
                              <Button size="sm" disabled={balance < opt.points || redeeming === opt.type}
                                onClick={() => handleRedeem(opt.type, opt.points, opt.label)}>
                                {redeeming === opt.type ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Gift className="h-4 w-4 mr-1" /> Redeem</>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Leaderboard Tab */}
              {tab === "leaderboard" && (
                <Card className="border-none shadow-sm"><CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {leaderboard.map((entry: any, idx: number) => (
                      <div key={entry.user_id}
                        className={`flex items-center justify-between p-4 transition-colors ${entry.user_id === user?.id ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                            {idx < 3 ? rankIcons[idx] : idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{entry.name}{entry.user_id === user?.id ? " (You)" : ""}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" /> {Number(entry.total_points).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
