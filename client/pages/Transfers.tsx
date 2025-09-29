import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStore, createId } from "@/state/store";
import type { PersonType, Transfer, TransferStatus } from "@shared/api";

export default function Transfers() {
  const { state, dispatch, isAdmin } = useStore();
  const [form, setForm] = useState({
    personId: "",
    personType: "Shareholder" as PersonType,
    company: "",
    transferDate: new Date().toISOString().slice(0, 10),
    status: "Initiated" as TransferStatus,
    expectedCreditDate: "",
    movedToIPF: false,
  });

  const peopleOfType = useMemo(() => state.people.filter(p => p.type === form.personType), [state.people, form.personType]);

  const submit = () => {
    if (!isAdmin) return;
    const person = state.people.find(p => p.id === form.personId);
    if (!person) return;
    const newT: Transfer = {
      id: createId("tr"),
      personId: person.id,
      personType: person.type,
      personName: person.name,
      company: form.company,
      transferDate: new Date(form.transferDate).toISOString(),
      status: form.status,
      expectedCreditDate: form.expectedCreditDate ? new Date(form.expectedCreditDate).toISOString() : undefined,
      movedToIPF: form.movedToIPF,
      dividendsReceived: form.movedToIPF ? Math.round(Math.random() * 1000) / 100 : undefined,
      pendingDividends: form.movedToIPF ? Math.round(Math.random() * 500) / 100 : undefined,
      bonusShares: form.movedToIPF ? Math.floor(Math.random() * 5) : undefined,
    };
    dispatch({ type: "UPSERT_TRANSFER", payload: newT });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Log Share Transfer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin && (
            <div className="text-sm text-muted-foreground">Only Admins can create transfers. Sign in as Admin from the sidebar.</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.personType} onValueChange={(v) => setForm((f) => ({ ...f, personType: v as PersonType, personId: "" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shareholder">Shareholder</SelectItem>
                  <SelectItem value="Stockholder">Stockholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Person</Label>
              <Select value={form.personId} onValueChange={(v) => setForm((f) => ({ ...f, personId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {peopleOfType.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Company name</Label>
              <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="e.g. TCS" />
            </div>
            <div className="space-y-2">
              <Label>Date of transfer</Label>
              <Input type="date" value={form.transferDate} onChange={(e) => setForm((f) => ({ ...f, transferDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Expected credit date</Label>
              <Input type="date" value={form.expectedCreditDate} onChange={(e) => setForm((f) => ({ ...f, expectedCreditDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as TransferStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initiated">Initiated</SelectItem>
                  <SelectItem value="In-Process">In-Process</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>IPF movement</Label>
              <Select value={String(form.movedToIPF)} onValueChange={(v) => setForm((f) => ({ ...f, movedToIPF: v === "true" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button disabled={!isAdmin} onClick={submit}>Save Transfer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Credit</TableHead>
                <TableHead>IPF</TableHead>
                <TableHead>Dividends</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Bonus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.transfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.personName}</TableCell>
                  <TableCell>{t.personType}</TableCell>
                  <TableCell>{t.company}</TableCell>
                  <TableCell>{new Date(t.transferDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === "Completed" ? "secondary" : "outline"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell>{t.expectedCreditDate ? new Date(t.expectedCreditDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{t.movedToIPF ? "Yes" : "No"}</TableCell>
                  <TableCell>{t.dividendsReceived?.toFixed(2) ?? "-"}</TableCell>
                  <TableCell>{t.pendingDividends?.toFixed(2) ?? "-"}</TableCell>
                  <TableCell>{t.bonusShares ?? "-"}</TableCell>
                </TableRow>
              ))}
              {state.transfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">No transfers yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
