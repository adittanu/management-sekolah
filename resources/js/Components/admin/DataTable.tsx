import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuTrigger 
} from "@/Components/ui/dropdown-menu"
import { MoreHorizontal, Search, Settings2, Plus } from "lucide-react"

export interface ColumnDef<T> {
    header: string
    accessorKey: keyof T | ((row: T) => any)
    cell?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
    data: T[]
    columns: ColumnDef<T>[]
    onSearch?: (query: string) => void
    title?: string
    actionLabel?: string
    onAction?: () => void
}

export function DataTable<T>({ 
    data, 
    columns, 
    title,
    actionLabel,
    onAction
}: DataTableProps<T>) {

    const [searchQuery, setSearchQuery] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 5;

    // Search Filtering
    const filteredData = React.useMemo(() => {
        if (!searchQuery) return data;
        return data.filter((row) => 
            Object.values(row as any).some((value) => 
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [data, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Reset page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                     {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
                     <div className="flex items-center gap-2 mt-2">
                         <div className="relative">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                             <Input 
                                placeholder="Cari..." 
                                className="pl-9 w-[300px] bg-white border-slate-200 focus-visible:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                         </div>
                         <Button variant="outline" size="icon" className="border-slate-200">
                             <Settings2 className="h-4 w-4 text-slate-500" />
                         </Button>
                     </div>
                </div>
                {actionLabel && (
                    <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg gap-2">
                        <Plus className="h-4 w-4" />
                        {actionLabel}
                    </Button>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                            {columns.map((col, i) => (
                                <TableHead key={i} className="text-slate-700 font-semibold h-12">
                                    {col.header}
                                </TableHead>
                            ))}
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                    {columns.map((col, colIndex) => (
                                        <TableCell key={colIndex} className="py-3">
                                            {col.cell 
                                                ? col.cell(row) 
                                                : typeof col.accessorKey === 'function' 
                                                    ? col.accessorKey(row)
                                                    : (row[col.accessorKey] as React.ReactNode)
                                            }
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit Data</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Hapus Data</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
                <div>
                    Menampilkan {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} sampai {Math.min(currentPage * pageSize, filteredData.length)} dari {filteredData.length} data
                </div>
                <div className="flex items-center gap-2">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                     >
                        Previous
                     </Button>
                     <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                     >
                        Next
                     </Button>
                </div>
            </div>
        </div>
    )
}
