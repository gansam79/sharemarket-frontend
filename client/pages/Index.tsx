import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calculateReport } from "@/state/store";
import { useStore } from "@/state/store";
import { useMemo, useState } from "react";

export default function Index() {
  const { state } = useStore();
  const upcomingExpiries = useMemo(() => {
    const now = new Date();
    const in10 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    return state.dmatAccounts.filter((a) => {
      const d = new Date(a.expiryDate);
      return d >= now && d <= in10;
    });
  }, [state.dmatAccounts]);

  const dividendsDue = useMemo(
    () => state.transfers.reduce((sum, t) => sum + (t.pendingDividends ?? 0), 0),
    [state.transfers],
  );

  const [reportForm, setReportForm] = useState({ symbol: "", quantity: 0, buyAmount: 0 });
  const report = calculateReport(reportForm);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Transfers" value={state.transfers.length} subtitle="Total logged" />
        <StatCard title="Upcoming expiries" value={upcomingExpiries.length} subtitle="Next 10 days" />
        <StatCard title="Dividends due" value={`₹${dividendsDue.toFixed(2)}`} subtitle="Estimated" />
        <StatCard title="DMAT Accounts" value={state.dmatAccounts.length} subtitle="Total" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.transfers.slice(-5).reverse().map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.personName}</TableCell>
                    <TableCell>{t.company}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "Completed" ? "secondary" : "outline"}>{t.status}</Badge>
                    </TableCell>
                    <TableCell>{t.expectedCreditDate ? new Date(t.expectedCreditDate).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                ))}
                {state.transfers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No transfers yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input value={reportForm.symbol} onChange={(e) => setReportForm((f) => ({ ...f, symbol: e.target.value }))} placeholder="e.g. TCS" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={reportForm.quantity} onChange={(e) => setReportForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Buy Amount (₹)</Label>
              <Input type="number" value={reportForm.buyAmount} onChange={(e) => setReportForm((f) => ({ ...f, buyAmount: Number(e.target.value) }))} />
            </div>
            <div className="rounded-md bg-muted p-3 text-sm">
              <div>Expected dividends: <strong>₹{report.expectedDividends.toFixed(2)}</strong></div>
              <div>Bonus allocation: <strong>{report.bonusAllocation}</strong> shares</div>
              <div>Remaining dues: <strong>₹{report.remainingDues.toFixed(2)}</strong></div>
            </div>
            <Button onClick={() => exportCSV(reportForm.symbol, report)}>Export CSV</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DMAT Expiry Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingExpiries.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.accountNumber}</TableCell>
                  <TableCell>{a.holderName}</TableCell>
                  <TableCell>{new Date(a.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{a.renewalStatus}</TableCell>
                </TableRow>
              ))}
              {upcomingExpiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No upcoming expiries</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: number | string; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

function exportCSV(symbol: string, r: { expectedDividends: number; bonusAllocation: number; remainingDues: number }) {
  const rows = [
    ["Symbol", "Expected Dividends", "Bonus Allocation", "Remaining Dues"],
    [symbol, r.expectedDividends, r.bonusAllocation, r.remainingDues],
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${symbol || "report"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
