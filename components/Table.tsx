import { ReactNode } from "react";
import { Table as UTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export default function Table<T extends Record<string, any>>({ columns, data, empty }: { columns: Column<T>[]; data: T[]; empty?: string }) {
  return (
    <UTable>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={String(c.key)} className={c.className}>{c.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={(row as any)._id || i}>
            {columns.map((c) => (
              <TableCell key={String(c.key)} className={c.className}>
                {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">{empty ?? "No data"}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </UTable>
  );
}
