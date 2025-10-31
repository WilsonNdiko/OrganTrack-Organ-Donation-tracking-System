import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Filter, Plus, Send, CheckCircle, Inbox, MapPin, RefreshCw } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api, Organ as BackendOrgan, OrganRequest } from "../../../src/services/api";

type Status = "available" | "in-transit" | "transplanted" | "requested";

const Registry = () => {
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isTransplantDialogOpen, setIsTransplantDialogOpen] = useState(false);
  const [transplantData, setTransplantData] = useState({
    recipientName: "",
    recipientAge: "",
    recipientBloodType: "",
    recipientHospital: "",
    surgeon: "",
    receiptNumber: "",
    transplantDate: "",
    notes: "",
  });
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isViewRequestsOpen, setIsViewRequestsOpen] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<BackendOrgan | null>(null);
  const [transferLocation, setTransferLocation] = useState("");
  const [requestingHospital, setRequestingHospital] = useState("");
  const [requests, setRequests] = useState<OrganRequest[]>([]);
  const [organs, setOrgans] = useState<BackendOrgan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "" as string,
    donorId: "",
    bloodType: "",
    location: "",
    recipientName: "",
    recipientBloodType: "",
    recipientContact: "",
  });
  const { toast } = useToast();

  // Fetch organs from backend
  const fetchOrgans = useCallback(async () => {
    try {
      console.log("🔄 Fetching organs from backend...");
      const data = await api.getOrgans();
      console.log("📦 Received organs:", data?.length || 0);
      setOrgans(data || []);
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to fetch organs:", error);
      setOrgans([]);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load organs from the backend.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch organ requests from backend
  const fetchOrganRequests = useCallback(async () => {
    try {
      console.log("🔄 Fetching organ requests...");
      const data = await api.getOrganRequests();
      console.log("📋 Received requests:", data?.length || 0);
      setRequests(data || []);
    } catch (error) {
      console.error("❌ Failed to fetch organ requests:", error);
      setRequests([]);
    }
  }, []);

  // Create Organ - Register new organ as NFT on Hedera
  const createOrgan = async () => {
    if (!formData.type || !formData.donorId || !formData.bloodType || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to register an organ.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.createOrgan({
        donor: "0x" + formData.donorId.padEnd(40, "0"), // Convert donor ID to address format
        organType: formData.type,
        bloodType: formData.bloodType,
        tokenURI: "",
        hospital: formData.location, // Include hospital location
      });

      // Reset form and close dialog
      setFormData({ type: "", donorId: "", bloodType: "", location: "", recipientName: "", recipientBloodType: "", recipientContact: "" });
      setIsDialogOpen(false);

      // Refresh data
      await fetchOrgans();

      toast({
        title: "✅ Organ Created on Hedera",
        description: `${formData.type} minted as NFT - Status: Available`,
      });
    } catch (error) {
      console.error("Error creating organ:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create organ on Hedera.",
        variant: "destructive",
      });
    }
  };

  // Transfer Organ - Move organ to different location
  const transferOrgan = async () => {
    if (!selectedOrgan || !transferLocation.trim()) {
      toast({
        title: "Invalid Transfer",
        description: "Please provide a destination location.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.transferOrgan({
        tokenId: selectedOrgan.tokenId,
        hospital: transferLocation,
      });

      // Mark that we made a change to prevent auto-refresh
      localStorage.setItem('lastOrganChange', Date.now().toString());

      // Update local state and refresh from backend
      setOrgans(organs.map(organ =>
        organ.tokenId === selectedOrgan.tokenId
          ? {
              ...organ,
              status: "Transferred",
              hospital: transferLocation,
              createdAt: new Date().toISOString()
            }
          : organ
      ));

      toast({
        title: "🚑 Organ Transfer Initiated",
        description: `${selectedOrgan.organType} en route to ${transferLocation}`,
      });

      setIsTransferDialogOpen(false);
      setSelectedOrgan(null);
      setTransferLocation("");

      // Refresh data from backend after a short delay
      setTimeout(() => fetchOrgans(), 1000);
    } catch (error) {
      console.error("Error transferring organ:", error);
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer organ.",
        variant: "destructive",
      });
    }
  };

  // Transplant Organ - Mark organ as successfully transplanted
  const transplantOrgan = async () => {
    if (!selectedOrgan) return;

    // Validate required fields
    if (!transplantData.recipientName || !transplantData.recipientHospital || !transplantData.surgeon) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required recipient details.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.transplantOrgan({
        tokenId: selectedOrgan.tokenId,
        recipient: `0x${Date.now().toString(16).padEnd(40, '0')}`, // Generate recipient address
        recipientName: transplantData.recipientName,
        recipientAge: parseInt(transplantData.recipientAge) || undefined,
        recipientBloodType: transplantData.recipientBloodType,
        recipientHospital: transplantData.recipientHospital,
        surgeon: transplantData.surgeon,
        notes: transplantData.notes,
      });

      // Mark that we made a change to prevent auto-refresh
      localStorage.setItem('lastOrganChange', Date.now().toString());

      // Update local state and refresh from backend
      setOrgans(organs.map(organ =>
        organ.tokenId === selectedOrgan.tokenId
          ? {
              ...organ,
              status: "Transplanted",
              createdAt: new Date().toISOString()
            }
          : organ
      ));

      toast({
        title: "💚 Transplant Successful",
        description: `${selectedOrgan.organType} successfully transplanted to ${transplantData.recipientName}`,
      });

      setIsTransplantDialogOpen(false);
      setSelectedOrgan(null);
      setTransplantData({
        recipientName: "",
        recipientAge: "",
        recipientBloodType: "",
        recipientHospital: "",
        surgeon: "",
        receiptNumber: "",
        transplantDate: "",
        notes: "",
      });

      // Refresh data from backend after a short delay
      setTimeout(() => fetchOrgans(), 1000);
    } catch (error) {
      console.error("Error transplanting organ:", error);
      toast({
        title: "Transplant Failed",
        description: "Failed to complete transplant.",
        variant: "destructive",
      });
    }
  };

  // Request Organ - Create a request from another hospital
  const requestOrgan = async () => {
    if (!selectedOrgan || !requestingHospital.trim()) {
      toast({
        title: "Invalid Request",
        description: "Please provide your hospital name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await api.createOrganRequest({
        organId: selectedOrgan.tokenId,
        requestingHospital: requestingHospital,
        owningHospital: "General Hospital",
        requesterAddress: `0x${Date.now().toString(16)}`, // Dummy address
      });

      if (result.success) {
        // Mark that we made changes to prevent auto-refresh
        localStorage.setItem('lastOrganChange', Date.now().toString());
        localStorage.setItem('lastRequestChange', Date.now().toString());

        // Update organ status locally for UI - changes to "Requested"
        setOrgans(organs.map(organ =>
          organ.tokenId === selectedOrgan.tokenId
            ? {
                ...organ,
                status: "Requested",
                createdAt: new Date().toISOString()
              }
            : organ
        ));

        // Force immediate refresh of requests
        console.log("🔄 Refreshing requests after creation...");
        await fetchOrganRequests();
        console.log("📋 Current requests count:", requests.length);

        // Also refresh after a short delay to ensure backend sync
        setTimeout(async () => {
          await fetchOrganRequests();
          await fetchOrgans();
        }, 1000);

        toast({
          title: "📨 Request Sent Successfully",
          description: `${selectedOrgan.organType} ${selectedOrgan.tokenId} requested by ${requestingHospital}`,
        });

        setIsRequestDialogOpen(false);
        setSelectedOrgan(null);
        setRequestingHospital("");
      } else {
        throw new Error(result.message || "Failed to create request");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Request Failed",
        description: "Failed to send organ request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Accept Request - Transfer organ to requesting hospital and change status
  const acceptRequest = async (request: OrganRequest) => {
    const organ = organs.find(o => o.tokenId.toString() === request.organ_id?.toString());
    if (!organ) return;

    try {
      await api.updateOrganRequest({
        requestId: request.request_id,
        status: 'accepted',
        organId: request.organ_id
      });

      toast({
        title: "✅ Request Accepted",
        description: `${organ.organType} ${organ.tokenId} now transferring to ${request.requesting_hospital}`,
      });

      // Refresh data
      await fetchOrgans();
      await fetchOrganRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Accept Failed",
        description: "Failed to accept organ request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reject Request - Change organ status back to "Donated"
  const rejectRequest = async (request: OrganRequest) => {
    const organ = organs.find(o => o.tokenId.toString() === request.organ_id?.toString());

    try {
      await api.updateOrganRequest({
        requestId: request.request_id,
        status: 'rejected',
        organId: request.organ_id
      });

      toast({
        title: "❌ Request Rejected",
        description: `Request from ${request.requesting_hospital} has been rejected - ${organ?.organType} ${organ?.tokenId} remains available`,
      });

      // Refresh data
      await fetchOrgans();
      await fetchOrganRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Reject Failed",
        description: "Failed to reject organ request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load organs and requests on component mount
  useEffect(() => {
    fetchOrgans();
    fetchOrganRequests();

    const organsInterval = setInterval(() => {
      // Only auto-refresh if no recent manual changes
      const lastChange = localStorage.getItem('lastOrganChange');
      const timeSinceChange = lastChange ? Date.now() - parseInt(lastChange) : Infinity;
      console.log("🔄 Auto-refresh check - time since last change:", timeSinceChange, "ms");
      if (timeSinceChange > 5000) { // 5 seconds after manual change
        console.log("🔄 Auto-refreshing organs...");
        fetchOrgans();
      } else {
        console.log("⏸️ Skipping auto-refresh - recent manual change detected");
      }
    }, 30000);

    const requestsInterval = setInterval(() => {
      // Only auto-refresh if no recent manual changes
      const lastChange = localStorage.getItem('lastRequestChange');
      const timeSinceChange = lastChange ? Date.now() - parseInt(lastChange) : Infinity;
      if (timeSinceChange > 5000) { // 5 seconds after manual change
        fetchOrganRequests();
      }
    }, 30000);

    return () => {
      clearInterval(organsInterval);
      clearInterval(requestsInterval);
    };
  }, [fetchOrgans, fetchOrganRequests]);

  // Force dialog refresh when requests change
  useEffect(() => {
    if (isViewRequestsOpen && requests.length > 0) {
      // Force a re-render of the dialog content
      console.log("🔄 Requests dialog updated with", requests.length, "requests");
    }
  }, [requests, isViewRequestsOpen]);

  // Map backend status to UI status
  const getStatusForBadge = (status: string): Status => {
    switch (status) {
      case "Donated": return "available";
      case "Transferred": return "in-transit";
      case "Transplanted": return "transplanted";
      case "Requested": return "requested";
      default: return "available";
    }
  };

  const filteredOrgans =
    filterStatus === "all" ? organs : organs.filter((organ) => getStatusForBadge(organ.status) === filterStatus);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">Organ Registry</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                All organs registered as NFTs on Hedera Hashgraph
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    Register a new organ as NFT on Hedera Hashgraph. Required fields marked with *.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  {/* Required Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Organ Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger id="type">
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
                        value={formData.donorId}
                        onChange={(e) =>
                          setFormData({ ...formData, donorId: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bloodType">Blood Type *</Label>
                      <Select
                        value={formData.bloodType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, bloodType: value })
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
                        value={formData.location}
                        onValueChange={(value) =>
                          setFormData({ ...formData, location: value })
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
                          value={formData.recipientName}
                          onChange={(e) =>
                            setFormData({ ...formData, recipientName: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="recipientBloodType">Recipient Blood Group</Label>
                        <Select
                          value={formData.recipientBloodType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, recipientBloodType: value })
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
                        value={formData.recipientContact}
                        onChange={(e) =>
                          setFormData({ ...formData, recipientContact: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createOrgan}>Register Organ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setIsViewRequestsOpen(true)}
            >
              <Inbox className="w-4 h-4" />
              Requests ({requests.filter(r => r.status === "pending").length})
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  size="sm"
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "available" ? "default" : "outline"}
                  onClick={() => setFilterStatus("available")}
                  size="sm"
                  className="text-xs"
                >
                  Available
                </Button>
                <Button
                  variant={filterStatus === "in-transit" ? "default" : "outline"}
                  onClick={() => setFilterStatus("in-transit")}
                  size="sm"
                  className="text-xs"
                >
                  In Transit
                </Button>
                <Button
                  variant={filterStatus === "transplanted" ? "default" : "outline"}
                  onClick={() => setFilterStatus("transplanted")}
                  size="sm"
                  className="text-xs"
                >
                  Transplanted
                </Button>
                <Button
                  variant={filterStatus === "requested" ? "default" : "outline"}
                  onClick={() => setFilterStatus("requested")}
                  size="sm"
                  className="text-xs"
                >
                  Requested
                </Button>
              </div>
            </div>
          </div>
        </div>

        <HeartbeatDivider />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading organs from Hedera...</p>
            </div>
          ) : (
            filteredOrgans.map((organ, index) => (
              <Card
                key={organ.tokenId}
                className="glass-card glow-on-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg font-display capitalize">{organ.organType || 'Unknown Organ'}</CardTitle>
                    </div>
                    <StatusBadge status={getStatusForBadge(organ.status)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">NFT ID:</span>
                      <span className="font-mono font-medium text-foreground text-right break-all">{organ.tokenId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Blood Type:</span>
                      <span className="font-medium text-foreground">{organ.bloodType || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground text-right">
                        {organ.hospital || 'Not assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span className="font-mono text-xs text-foreground">
                        {organ.createdAt ? new Date(organ.createdAt).toLocaleString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {getStatusForBadge(organ.status) === "available" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOrgan(organ);
                            setIsTransferDialogOpen(true);
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Transfer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOrgan(organ);
                            setIsRequestDialogOpen(true);
                          }}
                        >
                          <Inbox className="w-3 h-3 mr-1" />
                          Request
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOrgan(organ);
                            setIsTransplantDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Transplant
                        </Button>
                      </>
                    )}
                    {getStatusForBadge(organ.status) === "in-transit" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => markAsArrived(selectedOrgan || organ)}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Mark Arrived
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOrgan(organ);
                            setIsTransplantDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Transplant
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Transfer Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Organ</DialogTitle>
              <DialogDescription>
                Initiate transfer of {selectedOrgan?.organType} ({selectedOrgan?.tokenId}) to a new location
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="transferLocation">Destination Hospital</Label>
                <Select
                  value={transferLocation}
                  onValueChange={(value) => setTransferLocation(value)}
                >
                  <SelectTrigger id="transferLocation">
                    <SelectValue placeholder="Select destination hospital" />
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
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={transferOrgan}>Initiate Transfer</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Request Organ Dialog */}
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Organ Transfer</DialogTitle>
              <DialogDescription>
                Request {selectedOrgan?.organType} ({selectedOrgan?.tokenId})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="requestingHospital">Your Hospital Name</Label>
                <Select
                  value={requestingHospital}
                  onValueChange={(value) => setRequestingHospital(value)}
                >
                  <SelectTrigger id="requestingHospital">
                    <SelectValue placeholder="Select your hospital" />
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
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={requestOrgan}>Send Request</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Requests Dialog */}
        <Dialog open={isViewRequestsOpen} onOpenChange={setIsViewRequestsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Organ Requests</DialogTitle>
              <DialogDescription>
                Manage incoming requests for organ transfers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {requests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No requests yet</p>
              ) : (
                requests.map((request) => {
                  const organ = organs.find(o => o.tokenId.toString() === request.organ_id?.toString());
                  return (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">
                              {organ?.organType} ({request.organ_id})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              From: {request.requesting_hospital}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              To: {request.owning_hospital}
                            </p>
                          </div>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleString()}</p>
                        {request.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => acceptRequest(request)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectRequest(request)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Transplant Dialog */}
        <Dialog open={isTransplantDialogOpen} onOpenChange={setIsTransplantDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Complete Organ Transplant</DialogTitle>
              <DialogDescription>
                Record transplant details for {selectedOrgan?.organType} ({selectedOrgan?.tokenId}). All required fields must be completed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  placeholder="Full name of recipient"
                  value={transplantData.recipientName}
                  onChange={(e) => setTransplantData({ ...transplantData, recipientName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipientAge">Age</Label>
                  <Input
                    id="recipientAge"
                    type="number"
                    placeholder="Age"
                    value={transplantData.recipientAge}
                    onChange={(e) => setTransplantData({ ...transplantData, recipientAge: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recipientBloodType">Blood Type</Label>
                  <Select
                    value={transplantData.recipientBloodType}
                    onValueChange={(value) => setTransplantData({ ...transplantData, recipientBloodType: value })}
                  >
                    <SelectTrigger id="recipientBloodType">
                      <SelectValue placeholder="Select" />
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
              <div className="grid gap-2">
                <Label htmlFor="recipientHospital">Hospital *</Label>
                <Select
                  value={transplantData.recipientHospital}
                  onValueChange={(value) => setTransplantData({ ...transplantData, recipientHospital: value })}
                >
                  <SelectTrigger id="recipientHospital">
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="St. Mary's General Hospital">St. Mary's General Hospital</SelectItem>
                    <SelectItem value="City Medical Center">City Medical Center</SelectItem>
                    <SelectItem value="University Hospital">University Hospital</SelectItem>
                    <SelectItem value="Regional Health Center">Regional Health Center</SelectItem>
                    <SelectItem value="Metropolitan Medical Group">Metropolitan Medical Group</SelectItem>
                    <SelectItem value="Central Hospital">Central Hospital</SelectItem>
                    <SelectItem value="Eastside Medical Center">Eastside Medical Center</SelectItem>
                    <SelectItem value="West Valley Hospital">West Valley Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="receiptNumber">Receipt Number</Label>
                  <Input
                    id="receiptNumber"
                    placeholder="TX10023"
                    value={transplantData.receiptNumber}
                    onChange={(e) => setTransplantData({ ...transplantData, receiptNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transplantDate">Transplant Date</Label>
                  <Input
                    id="transplantDate"
                    type="date"
                    value={transplantData.transplantDate}
                    onChange={(e) => setTransplantData({ ...transplantData, transplantDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="surgeon">Surgeon *</Label>
                <Input
                  id="surgeon"
                  placeholder="Dr. Surgeon Name"
                  value={transplantData.surgeon}
                  onChange={(e) => setTransplantData({ ...transplantData, surgeon: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  placeholder="Any additional transplant details"
                  value={transplantData.notes}
                  onChange={(e) => setTransplantData({ ...transplantData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsTransplantDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={transplantOrgan}>Complete Transplant</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  // Local functions for the UI
  async function markAsArrived(organ: BackendOrgan) {
    console.log("🏥 Mark as arrived called for organ:", organ.tokenId);

    try {
      // Update organ status to "Donated" (Available) via API
      await api.transferOrgan({
        tokenId: organ.tokenId,
        hospital: organ.hospital || "General Hospital", // Keep same hospital
      });

      // Mark that we made a change to prevent auto-refresh
      const timestamp = Date.now().toString();
      localStorage.setItem('lastOrganChange', timestamp);
      console.log("💾 Set lastOrganChange timestamp:", timestamp);

      // Update local state
      setOrgans(organs.map(o =>
        o.tokenId === organ.tokenId
          ? { ...o, status: "Donated" }
          : o
      ));

      console.log("✅ Organ status updated to 'Donated' (Available)");
      toast({
        title: "📍 Organ Arrived",
        description: `${organ.organType} has arrived and is now available`,
      });

      // Refresh data from backend after a short delay
      setTimeout(() => fetchOrgans(), 1000);
    } catch (error) {
      console.error("Error marking organ as arrived:", error);
      toast({
        title: "Arrival Failed",
        description: "Failed to mark organ as arrived.",
        variant: "destructive",
      });
    }
  }
};

export default Registry;
