import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore, createId } from "@/state/store";
import type { Person, PersonType } from "@shared/api";

export default function PeoplePage({ type }: { type: PersonType }) {
  const { state, dispatch, isAdmin, role } = useStore();
  const [open, setOpen] = useState(false);

  const empty: Person = {
    id: "",
    type,
    name: "",
    email: "",
    phone: "",
    pan: "",
    dmatAccountId: undefined,
  };

  const [form, setForm] = useState<Person>(empty);
  const [editing, setEditing] = useState<Person | null>(null);

  const accountsById = useMemo(
    () => Object.fromEntries(state.dmatAccounts.map((d) => [d.id, d])),
    [state.dmatAccounts]
  );

  const list = useMemo(() => {
    const filtered = state.people.filter((p) => p.type === type);
    if (role === "Admin" || !state.currentUser) return filtered;
    if (role === "Shareholder" || role === "Stockholder") {
      return filtered.filter((p) => p.email === state.currentUser!.email);
    }
    return filtered;
  }, [state.people, state.currentUser, role, type]);

  const canEdit = (p?: Person) =>
    isAdmin || (!!p && p.email === state.currentUser?.email);

  const submit = () => {
    if (!isAdmin) return;
    const payload: Person = { ...form, id: form.id || createId("p") };
    dispatch({ type: "UPSERT_PERSON", payload });
    setOpen(false);
    setForm(empty);
  };

  const saveEdit = () => {
    if (!editing || !canEdit(editing)) return;
    dispatch({ type: "UPSERT_PERSON", payload: editing });
    setEditing(null);
  };

  const remove = (id: string) => {
    if (!isAdmin) return;
    dispatch({ type: "DELETE_PERSON", payload: id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{type}s</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isAdmin}>Add {type}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New {type}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>PAN</Label>
                  <Input
                    value={form.pan}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pan: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Linked DMAT</Label>
                  <Select
                    value={form.dmatAccountId ?? "none"}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        dmatAccountId: v === "none" ? undefined : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {state.dmatAccounts.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.accountNumber} — {d.holderName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={submit} disabled={!isAdmin}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All {type}s</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>DMAT</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {editing?.id === p.id ? (
                      <Input
                        value={editing.name}
                        onChange={(e) =>
                          setEditing((ed) => ({
                            ...(ed as Person),
                            name: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      p.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === p.id ? (
                      <Input
                        value={editing.email}
                        onChange={(e) =>
                          setEditing((ed) => ({
                            ...(ed as Person),
                            email: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      p.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === p.id ? (
                      <Input
                        value={editing.phone}
                        onChange={(e) =>
                          setEditing((ed) => ({
                            ...(ed as Person),
                            phone: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      p.phone
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === p.id ? (
                      <Input
                        value={editing.pan}
                        onChange={(e) =>
                          setEditing((ed) => ({
                            ...(ed as Person),
                            pan: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      p.pan
                    )}
                  </TableCell>
                  <TableCell>
                    {editing?.id === p.id ? (
                      <Select
                        value={editing.dmatAccountId ?? "none"}
                        onValueChange={(v) =>
                          setEditing((ed) => ({
                            ...(ed as Person),
                            dmatAccountId: v === "none" ? undefined : v,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {state.dmatAccounts.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.accountNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : p.dmatAccountId ? (
                      accountsById[p.dmatAccountId]?.accountNumber
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {editing?.id === p.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          disabled={!canEdit(editing)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditing({ ...p })}
                          disabled={!canEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(p.id)}
                          disabled={!isAdmin}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No records
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
