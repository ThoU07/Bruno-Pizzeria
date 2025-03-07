"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currency } from "@/shared/constants";
import { Edit, Loader2, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useConfirm } from "@/lib/stores/use-confirm";
import { toast } from "sonner";
import VoucherDialog from "./_components/voucher-dialog";
import { EVoucherType, IVoucher } from "@/types/voucher";
import { Badge } from "@/components/ui/badge";
import {
  deleteVoucher,
  getVouchers,
  updateVoucher,
} from "@/lib/actions/voucher.action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Page() {
  const [listVoucher, setListVoucher] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [open, setOpen] = useState(false);
  const { confirm } = useConfirm();

  const fetchListVoucher = async () => {
    try {
      const res = await getVouchers();
      setListVoucher(res);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  const handleClose = (value: boolean) => {
    if (voucher) setVoucher(null);
    setOpen(value);
  };

  const handleDelete = async (item: IVoucher) => {
    await confirm.danger(`Are you sure to delete ${item.name}?`, async () => {
      try {
        await deleteVoucher(item.$id);
        setListVoucher((prev) => prev.filter((c) => c.$id !== item.$id));
        toast.success(`Deleted ${item.name}`);
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong!");
      }
    });
  };

  const handleChangeStatus = async (voucherId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const voucher = listVoucher.find((item) => item.$id === voucherId)!;
      if (
        isActive &&
        new Date(voucher.endDate).getTime() < new Date().getTime()
      ) {
        await updateVoucher(voucherId, { isActive, endDate: new Date() });
        setListVoucher((prev) =>
          prev.map((item) =>
            item.$id === voucherId
              ? { ...item, isActive, endDate: new Date() }
              : item
          )
        );
      } else {
        await updateVoucher(voucherId, { isActive });
        setListVoucher((prev) =>
          prev.map((item) =>
            item.$id === voucherId ? { ...item, isActive } : item
          )
        );
      }

      toast.success("Status Updated");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListVoucher();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Voucher</h1>
        <VoucherDialog
          handleClose={handleClose}
          isOpen={open}
          voucher={voucher}
          setListVoucher={setListVoucher}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center font-semibold w-[50px]">
              #
            </TableHead>
            <TableHead className="text-center font-semibold w-[150px]">
              {loading && (
                <Loader2 className="animate-spin mr-1 inline-block size-4" />
              )}
              Status
            </TableHead>
            <TableHead className="text-center font-semibold">Code</TableHead>
            <TableHead className="text-center font-semibold">Name</TableHead>

            <TableHead className="text-center font-semibold">Value</TableHead>
            <TableHead className="text-center font-semibold">Start</TableHead>
            <TableHead className="text-center font-semibold">End</TableHead>
            <TableHead className="text-center font-semibold w-[100px]">
              Usage
            </TableHead>
            <TableHead className="text-center font-semibold w-[150px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listVoucher.map((item, index) => (
            <TableRow key={item.$id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Badge
                      className={
                        item.isActive
                          ? "bg-green cursor-pointer"
                          : "bg-gray-400 cursor-pointer"
                      }
                    >
                      {item.isActive ? "Active" : "Ended"}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleChangeStatus(item.$id, true)}
                    >
                      <Badge className="bg-green cursor-pointer mx-auto">
                        Active
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleChangeStatus(item.$id, false)}
                    >
                      <Badge className="bg-gray-400 cursor-pointer mx-auto">
                        Ended
                      </Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-center">{item.code}</TableCell>
              <TableCell className="text-center">{item.name}</TableCell>
              <TableCell className="text-right">
                {item.value.toLocaleString()}
                {item.type === EVoucherType.PERCENTAGE ? "%" : currency}
              </TableCell>
              <TableCell className="text-center">
                {new Date(item.startDate).toLocaleDateString("vi-VI")}
              </TableCell>
              <TableCell className="text-center">
                {new Date(item.endDate).toLocaleDateString("vi-VI")}
              </TableCell>
              <TableCell className="text-center">
                {item.currentUsageCount} /{item.maxUsageCount}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-yellow-400/50 hover:bg-yellow-500"
                    onClick={() => setVoucher(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-rose-400/50 hover:bg-rose-500"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
