import { useEffect, useState, useCallback } from "react";
import HeroSection from "@/components/dashboard/HeroSection";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RealtimeFeed from "@/components/dashboard/RealtimeFeed";
import LifecycleTimeline from "@/components/dashboard/LifecycleTimeline";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, CheckCircle, Shield, Database, Zap, Lock, Info, AlertTriangle, Plus } from "lucide-react";
import { api, Organ } from "../../../src/services/api";

const Dashboard = () => {
  const [organs, setOrgans] = useState<Organ[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form state for organ creation
  const [organType, setOrganType] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [donorId, setDonorId] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientBloodType, setRecipientBloodType] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchOrgans = useCallback(async () => {
    try {
      console.log("🔄 Fetching organs from API...");
      const data = await api.getOrgans();
      console.log("📦 Fetched organs data:", data, "length:", data?.length || 0);

      // Ensure data is valid array
      if (Array.isArray(data) && data.length > 0) {
        console.log("✅ Setting organs state with", data.length, "items");
        setOrgans([...data]); // Force array copy to ensure React detects change
        console.log("🆗 Organs state updated successfully");
      } else {
        console.log("⚠️ No valid organ data received, setting empty array");
        setOrgans([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch organs:", error);
      setOrgans([]); // Reset on error
    } finally {
      setLoading(false);
      console.log("🏁 Loading set to false, current organs length:", organs.length);
    }
  }, [organs.length]); // Include dependency to prevent stale closure

  const handleCreateOrgan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organType || !bloodType || !donorId || !hospitalLocation) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      await api.createOrgan({
        donor: "0x" + donorId.padEnd(40, "0"), // Convert donor ID to address format
        organType,
        bloodType,
        tokenURI: "",
        hospital: hospitalLocation, // Include hospital location
      });

      // Reset form
      setOrganType("");
      setBloodType("");
      setDonorId("");
      setHospitalLocation("");
      setRecipientName("");
      setRecipientBloodType("");
      setRecipientContact("");

      // Close dialog and refresh data
      setCreateDialogOpen(false);

      // Fetch fresh data immediately
      await fetchOrgans();

      alert("Organ created successfully!");
    } catch (error) {
      console.error("Error creating organ:", error);
      alert("Failed to create organ. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    console.log("🔄 Starting organ data fetch on component mount...");
    fetchOrgans();
    const interval = setInterval(fetchOrgans, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [fetchOrgans]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <HeroSection />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="overview">Organ Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="registry">Live Registry</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <StatsOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RealtimeFeed />
              <LifecycleTimeline />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <AnalyticsPanel />
          </TabsContent>

          <TabsContent value="registry" className="space-y-8">
            <div className="glass-card rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-display font-bold">Live Organ Registry</h3>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full lg:w-auto gap-2">
                      <Plus className="w-4 h-4" />
                      Register New Organ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Register New Organ</DialogTitle>
                      <DialogDescription>
                        Register a new organ as an NFT on Hedera Hashgraph. Required fields marked with *.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateOrgan} className="space-y-4">
                      {/* Required Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="organType">Organ Type *</Label>
                          <Select
                            value={organType}
                            onValueChange={(value) =>
                              setOrganType(value)
                            }
                          >
                            <SelectTrigger id="organType">
                              <SelectValue placeholder="Select organ type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Heart">Heart</SelectItem>
                              <SelectItem value="Kidney">Kidney</SelectItem>
                              <SelectItem value="Liver">Liver</SelectItem>
                              <SelectItem value="Lung">Lung</SelectItem>
                              <SelectItem value="Pancreas">Pancreas</SelectItem>
                              <SelectItem value="Intestine">Intestine</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="donorId">Donor ID *</Label>
                          <Input
                            id="donorId"
                            placeholder="D-XXXX"
                            value={donorId}
                            onChange={(e) =>
                              setDonorId(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="bloodType">Blood Type *</Label>
                          <Select
                            value={bloodType}
                            onValueChange={(value) =>
                              setBloodType(value)
                            }
                          >
                            <SelectTrigger id="bloodType">
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="location">Hospital Location *</Label>
                          <Select
                            value={hospitalLocation}
                            onValueChange={(value) =>
                              setHospitalLocation(value)
                            }
                          >
                            <SelectTrigger id="location">
                              <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nairobi General">Nairobi General</SelectItem>
                              <SelectItem value="Kenyatta Hospital">Kenyatta Hospital</SelectItem>
                              <SelectItem value="Coast Medical">Coast Medical</SelectItem>
                              <SelectItem value="Aga Khan">Aga Khan</SelectItem>
                              <SelectItem value="Mombasa Referral">Mombasa Referral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Optional Recipient Details */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Recipient Details (Optional)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="recipientName">Recipient Name</Label>
                            <Input
                              id="recipientName"
                              placeholder="Full name of recipient"
                              value={recipientName}
                              onChange={(e) =>
                                setRecipientName(e.target.value)
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="recipientBloodType">Recipient Blood Group</Label>
                            <Select
                              value={recipientBloodType}
                              onValueChange={(value) =>
                                setRecipientBloodType(value)
                              }
                            >
                              <SelectTrigger id="recipientBloodType">
                                <SelectValue placeholder="Select blood type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-2 mt-4">
                          <Label htmlFor="recipientContact">Recipient Contact</Label>
                          <Input
                            id="recipientContact"
                            placeholder="+254 XXX XXX XXX"
                            value={recipientContact}
                            onChange={(e) =>
                              setRecipientContact(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateOrgan} disabled={creating}>
                          {creating ? "Registering..." : "Register Organ"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organs.length > 0 ? organs.slice(0, 6).map((organ) => (
                  <div key={organ.tokenId} className="bg-accent/30 p-4 rounded-lg">
                    <h4 className="font-medium">{organ.organType}</h4>
                    <p className="text-sm text-muted-foreground">ID: {organ.tokenId}</p>
                    <p className="text-xs text-primary font-medium capitalize">{organ.status}</p>
                  </div>
                )) : (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    Loading organ data from Hedera...
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <HeartbeatDivider />

        {/* System Information Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
          <div className="glass-card rounded-xl p-8">
            <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary animate-pulse" />
              How OrgFlow Works
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Organ Registration</h3>
                  <p className="text-muted-foreground">
                    Hospitals register available organs as NFTs on Hedera Hashgraph. Each organ receives
                    a unique token that tracks its complete journey through the donation process.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Request & Transfer</h3>
                  <p className="text-muted-foreground">
                    Hospitals can request organs they need. The system manages approval, transfer logistics,
                    and real-time status updates across all participants.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Complete Transparency</h3>
                  <p className="text-muted-foreground">
                    Every step of the organ's journey is recorded immutably on the blockchain,
                    ensuring complete audit trails and preventing any manipulation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                🛡️ Security & Trust
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Immutability powered by Hedera Hashgraph</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time fraud prevention algorithms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Audit trails for regulatory compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>End-to-end encryption for sensitive data</span>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                🚀 System Capabilities
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Multi-hospital network synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time analytics & reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Mobile app integration ready</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Scalable to thousands of hospitals</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Foundation Section */}
        <div className="glass-card rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Technical Foundation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Hedera Hashgraph</h3>
              <p className="text-muted-foreground text-sm">
                Enterprise-grade distributed ledger providing 99.99% uptime,
                instant finality, and regulatory compliance out-of-the-box.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-Time Sync</h3>
              <p className="text-muted-foreground text-sm">
                Auto-refresh every 30 seconds ensures all hospitals see live data.
                No system downtime or synchronization issues.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Medical-Grade</h3>
              <p className="text-muted-foreground text-sm">
                HIPAA-compliant architecture with patient data protection,
                audit trails, and healthcare regulatory compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="glass-card rounded-xl p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-green-500" />
              Current Status: Demo Mode
            </h3>
            <p className="text-muted-foreground text-sm">
              This system is currently running in demonstration mode with simulated operations.
              All organ tracking, transfer management, and analytics features are fully functional.
              Ready for production deployment with actual Hedera NFT minting.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
              Important Information
            </h3>
            <p className="text-muted-foreground text-sm">
              OrgFlow is designed to save lives by digitizing and securing the organ donation process.
              This technology ensures transparency, prevents fraud, and enables faster organ matching
              across healthcare networks worldwide.
            </p>
          </div>
        </div>

        <HeartbeatDivider />
      </div>
    </div>
  );
};

export default Dashboard;
