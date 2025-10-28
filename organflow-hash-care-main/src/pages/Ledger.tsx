import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import HeartbeatDivider from "@/components/HeartbeatDivider";

interface Transaction {
  id: string;
  type: string;
  organ: string;
  timestamp: string;
  txHash: string;
}

const Ledger = () => {
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "Transplant Completed",
      organ: "Organ NFT #124",
      timestamp: "2024-01-27 14:03 UTC",
      txHash: "0x7d5f...c92a",
    },
    {
      id: "2",
      type: "Transit Started",
      organ: "Organ NFT #127",
      timestamp: "2024-01-27 13:45 UTC",
      txHash: "0x9a2b...d14c",
    },
    {
      id: "3",
      type: "Quality Verified",
      organ: "Organ NFT #129",
      timestamp: "2024-01-27 13:20 UTC",
      txHash: "0x3c8e...a76b",
    },
    {
      id: "4",
      type: "Donation Registered",
      organ: "Organ NFT #131",
      timestamp: "2024-01-27 12:55 UTC",
      txHash: "0x5f1d...e49a",
    },
    {
      id: "5",
      type: "Transplant Completed",
      organ: "Organ NFT #122",
      timestamp: "2024-01-27 12:30 UTC",
      txHash: "0x2e7a...b38c",
    },
    {
      id: "6",
      type: "Transit Started",
      organ: "Organ NFT #125",
      timestamp: "2024-01-27 11:45 UTC",
      txHash: "0x8b3f...c25d",
    },
    {
      id: "7",
      type: "Quality Verified",
      organ: "Organ NFT #128",
      timestamp: "2024-01-27 11:10 UTC",
      txHash: "0x4d9c...f67e",
    },
    {
      id: "8",
      type: "Donation Registered",
      organ: "Organ NFT #130",
      timestamp: "2024-01-27 10:30 UTC",
      txHash: "0x6a2e...d91b",
    },
  ];

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
                {transactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-all animate-slide-up border border-border/50"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {tx.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{tx.organ}</p>
                      <p className="text-xs text-muted-foreground mt-1">{tx.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">
                          {tx.txHash}
                        </code>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                    </div>
                  </div>
                ))}
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
