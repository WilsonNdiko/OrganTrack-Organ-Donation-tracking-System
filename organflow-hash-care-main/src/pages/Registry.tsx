import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Filter, Plus, Send, CheckCircle, Inbox, MapPin } from "lucide-react";
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

type OrganType = "heart" | "kidney" | "liver" | "lung" | "cornea";
type Status = "available" | "in-transit" | "transplanted" | "requested";

interface Organ {
  id: string;
  type: OrganType;
  donorId: string;
  bloodType: string;
  location: string;
  status: Status;
  timestamp: string;
}

interface OrganRequest {
  id: string;
  organId: string;
  requestingHospital: string;
  owningHospital: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: string;
}

const Registry = () => {
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isTransplantDialogOpen, setIsTransplantDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isViewRequestsOpen, setIsViewRequestsOpen] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
  const [transferLocation, setTransferLocation] = useState("");
  const [requestingHospital, setRequestingHospital] = useState("");
  const [requests, setRequests] = useState<OrganRequest[]>([]);
  const [organs, setOrgans] = useState<Organ[]>([
    {
      id: "NFT-001",
      type: "heart",
      donorId: "D-2847",
      bloodType: "O+",
      location: "Nairobi General Hospital",
      status: "in-transit",
      timestamp: "2024-01-27 14:30",
    },
    {
      id: "NFT-002",
      type: "kidney",
      donorId: "D-3921",
      bloodType: "A+",
      location: "Kenyatta Hospital",
      status: "transplanted",
      timestamp: "2024-01-27 13:15",
    },
    {
      id: "NFT-003",
      type: "liver",
      donorId: "D-4156",
      bloodType: "B-",
      location: "Aga Khan Hospital",
      status: "available",
      timestamp: "2024-01-27 12:00",
    },
    {
      id: "NFT-004",
      type: "lung",
      donorId: "D-5283",
      bloodType: "AB+",
      location: "Mater Hospital",
      status: "available",
      timestamp: "2024-01-27 11:45",
    },
    {
      id: "NFT-005",
      type: "cornea",
      donorId: "D-6794",
      bloodType: "O-",
      location: "Coast General Hospital",
      status: "in-transit",
      timestamp: "2024-01-27 10:30",
    },
    {
      id: "NFT-006",
      type: "kidney",
      donorId: "D-7821",
      bloodType: "A-",
      location: "Nakuru Level 5 Hospital",
      status: "transplanted",
      timestamp: "2024-01-27 09:20",
    },
  ]);
  const [formData, setFormData] = useState({
    type: "" as OrganType | "",
    donorId: "",
    bloodType: "",
    location: "",
  });
  const { toast } = useToast();

  // Create Organ - Register new organ as NFT on Hedera
  const createOrgan = () => {
    if (!formData.type || !formData.donorId || !formData.bloodType || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to register an organ.",
        variant: "destructive",
      });
      return;
    }

    const newOrgan: Organ = {
      id: `NFT-${String(organs.length + 1).padStart(3, "0")}`,
      type: formData.type,
      donorId: formData.donorId,
      bloodType: formData.bloodType,
      location: formData.location,
      status: "available",
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    // Simulate Hedera NFT minting
    setOrgans([newOrgan, ...organs]);
    setFormData({ type: "", donorId: "", bloodType: "", location: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "✅ Organ Created on Hedera",
      description: `${newOrgan.type} minted as ${newOrgan.id} NFT - Status: Available`,
    });
  };

  // Transfer Organ - Move organ to different location
  const transferOrgan = () => {
    if (!selectedOrgan || !transferLocation.trim()) {
      toast({
        title: "Invalid Transfer",
        description: "Please provide a destination location.",
        variant: "destructive",
      });
      return;
    }

    setOrgans(organs.map(organ => 
      organ.id === selectedOrgan.id
        ? { 
            ...organ, 
            status: "in-transit", 
            location: transferLocation,
            timestamp: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          }
        : organ
    ));

    toast({
      title: "🚑 Organ Transfer Initiated",
      description: `${selectedOrgan.type} ${selectedOrgan.id} en route to ${transferLocation}`,
    });

    setIsTransferDialogOpen(false);
    setSelectedOrgan(null);
    setTransferLocation("");
  };

  // Transplant Organ - Mark organ as successfully transplanted
  const transplantOrgan = () => {
    if (!selectedOrgan) return;

    setOrgans(organs.map(organ => 
      organ.id === selectedOrgan.id
        ? { 
            ...organ, 
            status: "transplanted",
            timestamp: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          }
        : organ
    ));

    toast({
      title: "💚 Transplant Successful",
      description: `${selectedOrgan.type} ${selectedOrgan.id} successfully transplanted at ${selectedOrgan.location}`,
    });

    setIsTransplantDialogOpen(false);
    setSelectedOrgan(null);
  };

  // Mark Arrived - Change status from in-transit back to available
  const markAsArrived = () => {
    if (!selectedOrgan) return;

    setOrgans(organs.map(organ => 
      organ.id === selectedOrgan.id
        ? { 
            ...organ, 
            status: "available",
            timestamp: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          }
        : organ
    ));

    toast({
      title: "📍 Organ Arrived",
      description: `${selectedOrgan.type} ${selectedOrgan.id} has arrived at ${selectedOrgan.location} and is now available`,
    });

    setSelectedOrgan(null);
  };

  // Request Organ - Create a request from another hospital
  const requestOrgan = () => {
    if (!selectedOrgan || !requestingHospital.trim()) {
      toast({
        title: "Invalid Request",
        description: "Please provide your hospital name.",
        variant: "destructive",
      });
      return;
    }

    const newRequest: OrganRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
      organId: selectedOrgan.id,
      requestingHospital: requestingHospital,
      owningHospital: selectedOrgan.location,
      status: "pending",
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    // Update organ status to "requested"
    setOrgans(organs.map(organ => 
      organ.id === selectedOrgan.id
        ? { 
            ...organ, 
            status: "requested",
            timestamp: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          }
        : organ
    ));

    setRequests([newRequest, ...requests]);

    toast({
      title: "📨 Request Sent",
      description: `Request sent to ${selectedOrgan.location} for ${selectedOrgan.type} ${selectedOrgan.id}`,
    });

    setIsRequestDialogOpen(false);
    setSelectedOrgan(null);
    setRequestingHospital("");
  };

  // Accept Request - Transfer organ to requesting hospital
  const acceptRequest = (request: OrganRequest) => {
    const organ = organs.find(o => o.id === request.organId);
    if (!organ) return;

    setOrgans(organs.map(o => 
      o.id === request.organId
        ? { 
            ...o, 
            status: "in-transit", 
            location: request.requestingHospital,
            timestamp: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          }
        : o
    ));

    setRequests(requests.map(r => 
      r.id === request.id ? { ...r, status: "accepted" } : r
    ));

    toast({
      title: "✅ Request Accepted",
      description: `${organ.type} ${organ.id} is now being transferred to ${request.requestingHospital}`,
    });
  };

  // Reject Request
  const rejectRequest = (request: OrganRequest) => {
    const organ = organs.find(o => o.id === request.organId);
    
    // Change organ status back to "available" when request is rejected
    if (organ) {
      setOrgans(organs.map(o => 
        o.id === request.organId
          ? { 
              ...o, 
              status: "available",
              timestamp: new Date().toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            }
          : o
      ));
    }

    setRequests(requests.map(r => 
      r.id === request.id ? { ...r, status: "rejected" } : r
    ));

    toast({
      title: "❌ Request Rejected",
      description: `Request from ${request.requestingHospital} has been rejected`,
    });
  };

  const filteredOrgans =
    filterStatus === "all" ? organs : organs.filter((organ) => organ.status === filterStatus);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">Organ Registry</h1>
              <p className="text-muted-foreground">
                All organs registered as NFTs on Hedera Hashgraph
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Register New Organ
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Register New Organ</DialogTitle>
                  <DialogDescription>
                    Register a new organ as an NFT on Hedera Hashgraph. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Organ Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value as OrganType })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select organ type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="heart">Heart</SelectItem>
                        <SelectItem value="kidney">Kidney</SelectItem>
                        <SelectItem value="liver">Liver</SelectItem>
                        <SelectItem value="lung">Lung</SelectItem>
                        <SelectItem value="cornea">Cornea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="donorId">Donor ID</Label>
                    <Input
                      id="donorId"
                      placeholder="D-XXXX"
                      value={formData.donorId}
                      onChange={(e) =>
                        setFormData({ ...formData, donorId: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
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
                    <Label htmlFor="location">Hospital Location</Label>
                    <Input
                      id="location"
                      placeholder="Hospital name"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsViewRequestsOpen(true)}
            >
              <Inbox className="w-4 h-4" />
              Requests ({requests.filter(r => r.status === "pending").length})
            </Button>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "available" ? "default" : "outline"}
                onClick={() => setFilterStatus("available")}
                size="sm"
              >
                Available
              </Button>
              <Button
                variant={filterStatus === "in-transit" ? "default" : "outline"}
                onClick={() => setFilterStatus("in-transit")}
                size="sm"
              >
                In Transit
              </Button>
              <Button
                variant={filterStatus === "transplanted" ? "default" : "outline"}
                onClick={() => setFilterStatus("transplanted")}
                size="sm"
              >
                Transplanted
              </Button>
              <Button
                variant={filterStatus === "requested" ? "default" : "outline"}
                onClick={() => setFilterStatus("requested")}
                size="sm"
              >
                Requested
              </Button>
            </div>
            </div>
          </div>
        </div>

        <HeartbeatDivider />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgans.map((organ, index) => (
            <Card
              key={organ.id}
              className="glass-card glow-on-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-display capitalize">{organ.type}</CardTitle>
                  </div>
                  <StatusBadge status={organ.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">NFT ID:</span>
                    <span className="font-mono font-medium text-foreground">{organ.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Donor ID:</span>
                    <span className="font-mono font-medium text-foreground">{organ.donorId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Blood Type:</span>
                    <span className="font-medium text-foreground">{organ.bloodType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium text-foreground text-right">{organ.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-mono text-xs text-foreground">{organ.timestamp}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {organ.status === "available" && (
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
                  {organ.status === "in-transit" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedOrgan(organ);
                          markAsArrived();
                        }}
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
          ))}
        </div>

        {/* Transfer Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Organ</DialogTitle>
              <DialogDescription>
                Initiate transfer of {selectedOrgan?.type} ({selectedOrgan?.id}) to a new location
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="transferLocation">Destination Hospital</Label>
                <Input
                  id="transferLocation"
                  placeholder="Enter hospital name"
                  value={transferLocation}
                  onChange={(e) => setTransferLocation(e.target.value)}
                />
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
                Request {selectedOrgan?.type} ({selectedOrgan?.id}) from {selectedOrgan?.location}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="requestingHospital">Your Hospital Name</Label>
                <Input
                  id="requestingHospital"
                  placeholder="Enter your hospital name"
                  value={requestingHospital}
                  onChange={(e) => setRequestingHospital(e.target.value)}
                />
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
                  const organ = organs.find(o => o.id === request.organId);
                  return (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">
                              {organ?.type} ({request.organId})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              From: {request.requestingHospital}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              To: {request.owningHospital}
                            </p>
                          </div>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">{request.timestamp}</p>
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

        {/* Transplant Confirmation Dialog */}
        <AlertDialog open={isTransplantDialogOpen} onOpenChange={setIsTransplantDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Transplant Completion</AlertDialogTitle>
              <AlertDialogDescription>
                Mark {selectedOrgan?.type} ({selectedOrgan?.id}) as successfully transplanted at{" "}
                {selectedOrgan?.location}? This action will update the organ status on Hedera Hashgraph.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={transplantOrgan}>Confirm Transplant</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Registry;
