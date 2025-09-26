import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Paginated } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Table from "@/components/Table";

interface DmatAccount { _id: string; accountNumber: string; holderName: string; expiryDate: string; renewalStatus: "Active" | "Expired" | "Pending" | "Expiring" }

export default function DmatAccounts() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const empty: Omit<DmatAccount, "_id"> = { accountNumber: "", holderName: "", expiryDate: new Date().toISOString().slice(0,10), renewalStatus: "Active" };
  const [form, setForm] = useState<Omit<DmatAccount, "_id">>(empty);
  const [editing, setEditing] = useState<DmatAccount | null>(null);

  const { data, isFetching } = useQuery<Paginated<DmatAccount>>({ queryKey: ["dmat", page], queryFn: async () => (await api.get<Paginated<DmatAccount>>("/dmat", { params: { page, limit: 10 } })).data });

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<DmatAccount, "_id">) => (await api.post<DmatAccount>("/dmat", payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dmat"] }); setForm(empty); },
  });
  const updateMutation = useMutation({
    mutationFn: async (payload: DmatAccount) => (await api.put<DmatAccount>(`/dmat/${payload._id}`, payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dmat"] }); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/dmat/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dmat"] }); },
  });

  const columns = useMemo(() => [
    { key: "accountNumber", header: "Account", render: (d: DmatAccount) => editing?._id === d._id ? <Input value={editing.accountNumber} onChange={(e)=>setEditing({ ...(editing as DmatAccount), accountNumber: e.target.value })} /> : d.accountNumber },
    { key: "holderName", header: "Holder", render: (d: DmatAccount) => editing?._id === d._id ? <Input value={editing.holderName} onChange={(e)=>setEditing({ ...(editing as DmatAccount), holderName: e.target.value })} /> : d.holderName },
    { key: "expiryDate", header: "Expiry", render: (d: DmatAccount) => editing?._id === d._id ? <Input type="date" value={(editing.expiryDate).slice(0,10)} onChange={(e)=>setEditing({ ...(editing as DmatAccount), expiryDate: e.target.value })} /> : new Date(d.expiryDate).toLocaleDateString() },
    { key: "renewalStatus", header: "Status", render: (d: DmatAccount) => editing?._id === d._id ? (
      <Select value={editing.renewalStatus} onValueChange={(v)=>setEditing({ ...(editing as DmatAccount), renewalStatus: v as DmatAccount["renewalStatus"] })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Expired">Expired</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Expiring">Expiring</SelectItem>
        </SelectContent>
      </Select>
    ) : d.renewalStatus },
    { key: "actions", header: "Actions", render: (d: DmatAccount) => editing?._id === d._id ? (
      <div className="space-x-2">
        <Button size="sm" onClick={() => updateMutation.mutate(editing!)} disabled={updateMutation.isPending}>Save</Button>
        <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
      </div>
    ) : (
      <div className="space-x-2">
        <Button size="sm" variant="secondary" onClick={() => setEditing(d)}>Edit</Button>
        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(d._id)} disabled={deleteMutation.isPending}>Delete</Button>
      </div>
    ), className: "w-[160px]" },
  ], [editing, updateMutation.isPending, deleteMutation.isPending]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">DMAT Accounts</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Account</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Account Number</Label><Input value={form.accountNumber} onChange={(e)=>setForm((f)=>({ ...f, accountNumber: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Holder Name</Label><Input value={form.holderName} onChange={(e)=>setForm((f)=>({ ...f, holderName: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={(e)=>setForm((f)=>({ ...f, expiryDate: e.target.value }))} /></div>
          <div className="space-y-1"><Label>Renewal Status</Label>
            <Select value={form.renewalStatus} onValueChange={(v)=>setForm((f)=>({ ...f, renewalStatus: v as DmatAccount["renewalStatus"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Expiring">Expiring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Button onClick={()=>createMutation.mutate(form)} disabled={createMutation.isPending}>Create</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Accounts</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table columns={columns as any} data={(data?.data ?? [])} empty={isFetching ? "Loading..." : "No accounts"} />
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>Page {data?.page ?? page} of {data ? Math.ceil((data.total ?? 0) / (data.limit || 10)) : 1}</div>
            <div className="space-x-2">
              <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={()=>setPage((p)=>Math.max(1, p-1))}>Prev</Button>
              <Button variant="secondary" size="sm" disabled={!!data && page >= Math.ceil((data.total ?? 0) / (data.limit || 10)) || isFetching} onClick={()=>setPage((p)=>p+1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
