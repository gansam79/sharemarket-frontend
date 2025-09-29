import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Paginated } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Table from "@/components/Table";
import { toast } from "react-toastify";

interface DmatAccount { _id: string; accountNumber: string; holderName: string; expiryDate: string; renewalStatus: string }
interface Shareholder { _id: string; name: string; email: string; phone: string; pan: string; type: "Shareholder" | "Stockholder"; linkedDmatAccount?: DmatAccount | string }

export default function Shareholders() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const empty: Omit<Shareholder, "_id"> = { name: "", email: "", phone: "", pan: "", type: "Shareholder", linkedDmatAccount: undefined };
  const [form, setForm] = useState<Omit<Shareholder, "_id">>(empty);
  const [editing, setEditing] = useState<Shareholder | null>(null);

  const { data: dmat } = useQuery<DmatAccount[]>({
    queryKey: ["dmat", "all"],
    queryFn: async () => (await api.get<Paginated<DmatAccount>>("/dmat", { params: { page: 1, limit: 1000 } })).data.data
  });

  const { data, isFetching } = useQuery<Paginated<Shareholder>>({
    queryKey: ["shareholders", page],
    queryFn: async () => (await api.get<Paginated<Shareholder>>("/shareholders", { params: { page, limit: 10 } })).data
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Omit<Shareholder, "_id">) => (await api.post<Shareholder>("/shareholders", payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shareholders"] });
      setOpen(false);
      setForm(empty);
      toast.success("Shareholder created successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || err.message)
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Shareholder) =>
      (await api.put<Shareholder>(`/shareholders/${payload._id}`, {
        ...payload,
        linkedDmatAccount: (payload.linkedDmatAccount as any)?._id || payload.linkedDmatAccount
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shareholders"] });
      setEditing(null);
      toast.success("Shareholder updated successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/shareholders/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shareholders"] });
      toast.success("Shareholder deleted successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || err.message)
  });

  const columns = useMemo(() => [
    { key: "name", header: "Name", render: (r: Shareholder) => editing?._id === r._id ? <Input value={editing.name} onChange={(e) => setEditing({ ...(editing as Shareholder), name: e.target.value })} /> : r.name },
    { key: "email", header: "Email", render: (r: Shareholder) => editing?._id === r._id ? <Input value={editing.email} onChange={(e) => setEditing({ ...(editing as Shareholder), email: e.target.value })} /> : r.email },
    { key: "phone", header: "Phone", render: (r: Shareholder) => editing?._id === r._id ? <Input value={editing.phone} onChange={(e) => setEditing({ ...(editing as Shareholder), phone: e.target.value })} /> : r.phone },
    { key: "pan", header: "PAN", render: (r: Shareholder) => editing?._id === r._id ? <Input value={editing.pan} onChange={(e) => setEditing({ ...(editing as Shareholder), pan: e.target.value.toUpperCase() })} /> : r.pan },
    {
      key: "linkedDmatAccount",
      header: "DMAT",
      render: (r: Shareholder) =>
        editing?._id === r._id ? (
          <Select value={(editing.linkedDmatAccount as any)?._id || (editing.linkedDmatAccount as any) || "none"} onValueChange={(v) => setEditing({ ...(editing as Shareholder), linkedDmatAccount: v === "none" ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {(dmat ?? []).map((d) => <SelectItem key={d._id} value={d._id}>{d.accountNumber} — {d.holderName}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (typeof r.linkedDmatAccount === "object" && r.linkedDmatAccount ? (r.linkedDmatAccount as DmatAccount).accountNumber : "—")
    },
    {
      key: "actions",
      header: "Actions",
      render: (r: Shareholder) => editing?._id === r._id ? (
        <div className="space-x-2">
          <Button size="sm" onClick={() => updateMutation.mutate(editing!)} disabled={updateMutation.isPending}>Save</Button>
          <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
        </div>
      ) : (
        <div className="space-x-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(r)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(r._id)} disabled={deleteMutation.isPending}>Delete</Button>
        </div>
      ),
      className: "w-[180px]"
    }
  ], [editing, dmat, updateMutation.isPending, deleteMutation.isPending]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Shareholders & Stockholders</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Add Person</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Person</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e)=>setForm(f=>({ ...f, phone: e.target.value }))} /></div>
                <div className="space-y-1"><Label>PAN</Label><Input value={form.pan} onChange={(e)=>setForm(f=>({ ...f, pan: e.target.value.toUpperCase() }))} /></div>
                <div className="space-y-1"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v)=>setForm(f=>({ ...f, type: v as Shareholder["type"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shareholder">Shareholder</SelectItem>
                      <SelectItem value="Stockholder">Stockholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 col-span-2"><Label>Linked DMAT</Label>
                  <Select value={(form.linkedDmatAccount as any) || "none"} onValueChange={(v)=>setForm(f=>({ ...f, linkedDmatAccount: v === "none" ? undefined : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(dmat ?? []).map((d)=> <SelectItem key={d._id} value={d._id}>{d.accountNumber} — {d.holderName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={()=>createMutation.mutate(form)} disabled={createMutation.isPending}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All People</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table columns={columns as any} data={(data?.data ?? [])} empty={isFetching ? "Loading..." : "No records"} />
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>Page {data?.page ?? page} of {data ? Math.ceil((data.total ?? 0) / (data.limit || 10)) : 1}</div>
            <div className="space-x-2">
              <Button variant="secondary" size="sm" disabled={page <= 1 || isFetching} onClick={()=>setPage(p=>Math.max(1, p-1))}>Prev</Button>
              <Button variant="secondary" size="sm" disabled={!!data && page >= Math.ceil((data.total ?? 0) / (data.limit || 10)) || isFetching} onClick={()=>setPage(p=>p+1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
