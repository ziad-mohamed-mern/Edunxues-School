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
import { TrendingDown, Building, Zap, PlusCircle } from "lucide-react";

const mockExpenses = [
  {
    id: "1",
    item: "Electricity Bill",
    category: "Utilities",
    amount: "$1,200.00",
    date: "2024-04-01",
    status: "Paid",
  },
  {
    id: "2",
    item: "New Computers for Lab",
    category: "Equipment",
    amount: "$5,400.00",
    date: "2024-04-05",
    status: "Approved",
  },
  {
    id: "3",
    item: "Plumbing Maintenance",
    category: "Maintenance",
    amount: "$350.00",
    date: "2024-04-10",
    status: "Pending",
  },
  {
    id: "4",
    item: "Internet Subscription",
    category: "Utilities",
    amount: "$200.00",
    date: "2024-04-12",
    status: "Paid",
  },
];

export default function Expenses() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Manage and track institutional spending.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Outflow</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,431.00</div>
            <p className="text-xs text-muted-foreground">
              +4.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational Costs</CardTitle>
            <Building className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,250.00</div>
            <p className="text-xs text-muted-foreground">
              Maintenance and Admin
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilities</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,400.00</div>
            <p className="text-xs text-muted-foreground">
              Electricity, Water, Internet
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Register</CardTitle>
          <CardDescription>
            Detailed breakdown of recent institutional expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.item}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.amount}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        expense.status === "Paid"
                          ? "default"
                          : expense.status === "Approved"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        expense.status === "Paid" 
                          ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25" 
                          : expense.status === "Approved"
                          ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25"
                          : "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25"
                     }
                    >
                      {expense.status}
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
