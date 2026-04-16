import { useState } from "react";
import { toast } from "sonner";
import { Shield, Plus, Pencil, Trash2, Users, Lock, Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockRoles = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access with all privileges.",
    usersCount: 2,
    permissions: ["read", "write", "delete", "manage"],
    color: "bg-red-500/15 text-red-600",
  },
  {
    id: "2",
    name: "Admin",
    description: "Manages users, classes, and school settings.",
    usersCount: 5,
    permissions: ["read", "write", "manage"],
    color: "bg-orange-500/15 text-orange-600",
  },
  {
    id: "3",
    name: "Teacher",
    description: "Can manage classes, assignments, and student grades.",
    usersCount: 42,
    permissions: ["read", "write"],
    color: "bg-blue-500/15 text-blue-600",
  },
  {
    id: "4",
    name: "Student",
    description: "Read-only access to learning materials and schedules.",
    usersCount: 620,
    permissions: ["read"],
    color: "bg-emerald-500/15 text-emerald-600",
  },
  {
    id: "5",
    name: "Parent",
    description: "View-only access to their child's profile and grades.",
    usersCount: 210,
    permissions: ["read"],
    color: "bg-purple-500/15 text-purple-600",
  },
];

const permissionIcons: Record<string, React.ReactNode> = {
  read: <Eye className="h-3 w-3" />,
  write: <Pencil className="h-3 w-3" />,
  delete: <Trash2 className="h-3 w-3" />,
  manage: <Lock className="h-3 w-3" />,
};

const permissionColors: Record<string, string> = {
  read: "bg-sky-500/15 text-sky-700",
  write: "bg-amber-500/15 text-amber-700",
  delete: "bg-red-500/15 text-red-700",
  manage: "bg-purple-500/15 text-purple-700",
};

export default function Roles() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Configure roles and the permissions granted to each.
          </p>
        </div>
        <Button onClick={() => toast.info("Role creation coming soon!")}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoles.length}</div>
            <p className="text-xs text-muted-foreground">Defined in the system</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRoles.reduce((acc, r) => acc + r.usersCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all roles</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Levels</CardTitle>
            <Lock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Read, Write, Delete, Manage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>
            All roles and their associated permissions. Click a row to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRoles.map((role) => (
                <TableRow key={role.id} className="cursor-pointer">
                  <TableCell>
                    <Badge variant="outline" className={role.color}>
                      {role.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs">
                    {role.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{role.usersCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((perm) => (
                        <Badge
                          key={perm}
                          variant="outline"
                          className={`flex items-center gap-1 text-xs ${permissionColors[perm]}`}
                        >
                          {permissionIcons[perm]}
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.info(`Editing "${role.name}" coming soon!`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          toast.error(`Deleting "${role.name}" is restricted.`)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
