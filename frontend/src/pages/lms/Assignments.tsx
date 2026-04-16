import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { Plus, Loader2, ClipboardList, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AssignmentGenerator from "@/components/lms/AssignmentGenerator";
import type { assignment } from "@/types";

export default function Assignments() {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const [assignments, setAssignments] = useState<assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [openGen, setOpenGen] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/assignments");
      setAssignments(data);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const { data } = await api.patch(`/assignments/${id}/status`);
      toast.success(data.message);
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            {isTeacher
              ? "Generate and manage AI assignments for classes."
              : "View active assignments for your class."}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setOpenGen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New AI Assignment
          </Button>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No assignments found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <Card key={a._id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <Badge variant={a.isActive ? "default" : "secondary"}>
                    {a.isActive ? "Active" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardList className="h-4 w-4" /> {a.subject.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {a.class.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </div>
                <div className="pt-2 space-y-2">
                  {a.tasks.slice(0, 3).map((t, i) => (
                    <div key={i} className="text-sm border rounded p-2">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-muted-foreground">{t.instructions}</p>
                    </div>
                  ))}
                </div>
                {isTeacher && (
                  <Button
                    className="w-full mt-2"
                    variant={a.isActive ? "destructive" : "default"}
                    onClick={() => toggleStatus(a._id)}
                  >
                    {a.isActive ? "Unpublish Assignment" : "Publish Assignment"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AssignmentGenerator
        open={openGen}
        onOpenChange={setOpenGen}
        onSuccess={fetchAssignments}
      />
    </div>
  );
}
