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
import { Users, CreditCard, CalendarClock, HandCoins } from "lucide-react";

const mockSalaries = [
  {
    id: "1",
    staff: "Dr. Emily Chen",
    role: "Teacher",
    baseSalary: "$4,500.00",
    bonus: "$0.00",
    status: "Processed",
  },
  {
    id: "2",
    staff: "Mr. James Wilson",
    role: "Administrator",
    baseSalary: "$5,200.00",
    bonus: "$300.00",
    status: "Pending",
  },
  {
    id: "3",
    staff: "Sarah Connor",
    role: "Librarian",
    baseSalary: "$3,100.00",
    bonus: "$0.00",
    status: "Processed",
  },
  {
    id: "4",
    staff: "Marcus Johnson",
    role: "Teacher",
    baseSalary: "$4,100.00",
    bonus: "$500.00",
    status: "Pending",
  },
];

export default function Salary() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll & Salary</h2>
          <p className="text-muted-foreground">
            Manage staff compensation and payroll processing.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <HandCoins className="mr-2 h-4 w-4" /> Run Payroll
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll File</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$16,900.00</div>
            <p className="text-xs text-muted-foreground">
              For the current billing cycle
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Eligible for payroll
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Processing</CardTitle>
            <CalendarClock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">April 30</div>
            <p className="text-xs text-muted-foreground">
              7 days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Salary Overview</CardTitle>
          <CardDescription>
            Current cycle compensation breakdown by staff member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Bonus/Deductions</TableHead>
                <TableHead>Payout Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell className="font-medium">{salary.staff}</TableCell>
                  <TableCell>{salary.role}</TableCell>
                  <TableCell>{salary.baseSalary}</TableCell>
                  <TableCell>{salary.bonus}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        salary.status === "Processed"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        salary.status === "Processed" 
                          ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25" 
                          : "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25"
                      }
                    >
                      {salary.status}
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
