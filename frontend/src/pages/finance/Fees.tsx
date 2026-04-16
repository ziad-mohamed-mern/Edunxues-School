import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, WalletCards, CreditCard, PlusCircle } from "lucide-react";

const mockFeeRecords = [
  {
    id: "1",
    student: "Alice Smith",
    class: "10-A",
    amount: "$500.00",
    date: "2024-04-10",
    status: "Paid",
  },
  {
    id: "2",
    student: "Bob Johnson",
    class: "11-B",
    amount: "$550.00",
    date: "2024-04-12",
    status: "Pending",
  },
  {
    id: "3",
    student: "Charlie Brown",
    class: "9-C",
    amount: "$480.00",
    date: "2024-04-15",
    status: "Paid",
  },
  {
    id: "4",
    student: "Diana Prince",
    class: "12-A",
    amount: "$600.00",
    date: "2024-04-16",
    status: "Overdue",
  },
];

export default function Fees() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fees Management</h2>
          <p className="text-muted-foreground">
            Overview of student fee collections and dues.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Collect Fee
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <WalletCards className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450.00</div>
            <p className="text-xs text-muted-foreground">
              Across 45 students
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+124</div>
            <p className="text-xs text-muted-foreground">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Fee Records</CardTitle>
          <CardDescription>
            A list of the most recent fee transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFeeRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.student}</TableCell>
                  <TableCell>{record.class}</TableCell>
                  <TableCell>{record.amount}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "Paid"
                          ? "default"
                          : record.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                         record.status === "Paid" 
                           ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25" 
                           : record.status === "Pending"
                           ? "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25"
                           : "bg-red-500/15 text-red-600 hover:bg-red-500/25"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
