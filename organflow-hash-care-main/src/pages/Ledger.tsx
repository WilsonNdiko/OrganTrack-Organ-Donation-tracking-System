import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ExternalLink, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import { api } from "../../../src/services/api";

interface LedgerEvent {
  id: string;
  eventType?: string;
  type?: string;
  organId?: number;
  organType?: string;
  bloodType?: string;
  hospital?: string;
  donor?: string;
  recipient?: string;
  surgeon?: string;
  receiptNumber?: string;
  transplantDate?: string;
  timestamp: string;
  txHash: string;
  details?: string;
}

const Ledger = () => {
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ledger events from backend
  const fetchLedgerEvents = async () => {
    try {
      console.log("🔄 Fetching ledger events from backend...");
      const data = await api.getLedger();
      console.log("📖 Received ledger events:", data?.length || 0);
      setLedgerEvents(data || []);
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to fetch ledger events:", error);
      setLedgerEvents([]);
      setLoading(false);
    }
  };

  // Load ledger events on component mount
  useEffect(() => {
    fetchLedgerEvents();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLedgerEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Format ledger event according to specification
  const formatLedgerEvent = (event: LedgerEvent): string => {
    const date = new Date(event.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD format
    const type = event.eventType || event.type || '';

    if (type === 'OrganTransplanted') {
      return `[${date}] OrganTransplanted - ${event.organType} - Surgeon: ${event.surgeon} - Receipt: #${event.receiptNumber}`;
    } else if (type === 'organ_created' || type === 'OrganRegistered') {
      return `[${date}] OrganRegistered - ${event.organType} - Donor: ${event.donor} → Recipient: ${event.recipient || 'Pending'} (${event.hospital})`;
    } else if (type === 'organ_transferred') {
      return `[${date}] OrganTransferred - ${event.organType} - To: ${event.hospital}`;
    } else if (type === 'organ_arrived') {
      return `[${date}] OrganArrived - ${event.organType} - At: ${event.hospital}`;
    } else {
      return `[${date}] ${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${event.organType}`;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-display font-bold text-foreground">
              Transparency Ledger
            </h1>
          </div>
          <p className="text-muted-foreground">
            Public Hedera Hashgraph blockchain records - Every transaction is verified and immutable
          </p>
        </div>

        <HeartbeatDivider />

        <Card className="glass-card glow-on-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Shield className="w-5 h-5 text-primary" />
              Verified Blockchain Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading ledger events from Hedera...</p>
                  </div>
                ) : ledgerEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No ledger events recorded yet</p>
                  </div>
                ) : (
                  ledgerEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg bg-accent/50 hover:bg-accent transition-all animate-slide-up border border-border/50"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-mono text-foreground">
                          {formatLedgerEvent(event)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          Transaction ID: {event.txHash.slice(0, 16)}...{event.txHash.slice(-8)}
                        </p>
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 glass-card rounded-xl text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            Built on Hedera Hashgraph
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every organ donation, transfer, and transplant is recorded on an immutable, public
            ledger. This ensures complete transparency, accountability, and trust in the organ
            donation process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
