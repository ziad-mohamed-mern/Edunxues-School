import { useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Pencil,
  Link2,
  Loader2,
  Download,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useAuth } from "@/hooks/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type MaterialType = "PDF" | "Link" | "Doc";

interface MaterialItem {
  id: string;
  title: string;
  subject: string;
  type: MaterialType;
  description: string;
  url: string;
  longDescription?: string[];
}

interface MaterialSection {
  id: string;
  sectionTitle: string;
  subject: string;
  materials: MaterialItem[];
}

interface DisplayMaterial extends MaterialItem {
  sectionTitle: string;
}

const typeIcon = {
  PDF: FileText,
  Link: Link2,
  Doc: BookOpen,
};

const buildTenLineDescription = (
  subject: string,
  level: string,
  topic: string,
  baseDescription: string
) => {
  const focus = topic.trim() || "core fundamentals";
  const lines = [
    `Overview of ${subject} for ${level}.`,
    `Learning focus: ${focus}.`,
    `${baseDescription}`,
    `Key concept 1: definitions and practical meaning.`,
    `Key concept 2: common mistakes and how to avoid them.`,
    `Step-by-step method for solving standard questions.`,
    `Worked example with explanation and final answer.`,
    `Mini practice set with increasing difficulty.`,
    `Quick revision checklist before exam.`,
    `Teacher tip: review this summary once daily for 7 days.`,
  ];
  return lines.slice(0, 10);
};

const generatePdfBlobUrl = (title: string, lines: string[]) => {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  let y = 60;

  pdf.setFontSize(16);
  pdf.text(title, marginX, y);
  y += 30;

  pdf.setFontSize(11);
  lines.forEach((line, index) => {
    const wrapped = pdf.splitTextToSize(`${index + 1}. ${line}`, 500);
    pdf.text(wrapped, marginX, y);
    y += wrapped.length * 16 + 6;
  });

  const blob = pdf.output("blob");
  return URL.createObjectURL(blob);
};

export default function Materials() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [subjectInput, setSubjectInput] = useState("");
  const [levelInput, setLevelInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sections, setSections] = useState<MaterialSection[]>([]);
  const [previewMaterial, setPreviewMaterial] = useState<DisplayMaterial | null>(
    null
  );
  const [editingMaterial, setEditingMaterial] = useState<DisplayMaterial | null>(
    null
  );
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<MaterialType>("Doc");
  const [editDescription, setEditDescription] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const subjects = useMemo(
    () => [
      "All",
      ...Array.from(new Set(sections.flatMap((s) => s.materials.map((m) => m.subject)))),
    ],
    [sections]
  );

  const allMaterials = useMemo<DisplayMaterial[]>(
    () =>
      sections.flatMap((section) =>
        section.materials.map((material) => ({
          ...material,
          sectionTitle: section.sectionTitle,
        }))
      ),
    [sections]
  );

  const filtered = useMemo(() => {
    return allMaterials.filter((material) => {
      const matchSubject =
        subjectFilter === "All" || material.subject === subjectFilter;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        material.title.toLowerCase().includes(q) ||
        material.description.toLowerCase().includes(q);
      return matchSubject && matchQuery;
    });
  }, [allMaterials, query, subjectFilter]);

  const generateSection = async () => {
    if (!subjectInput.trim() || !levelInput.trim()) {
      toast.error("Subject and class level are required");
      return;
    }
    try {
      setGenerating(true);
      const { data } = await api.post("/dashboard/materials/generate", {
        subject: subjectInput.trim(),
        level: levelInput.trim(),
        topic: topicInput.trim(),
      });

      const materials: MaterialItem[] = Array.isArray(data.materials)
        ? data.materials.map((m: any) => ({
            id: crypto.randomUUID(),
            title: m.title || "Untitled",
            subject: subjectInput.trim(),
            type: ["PDF", "Link", "Doc"].includes(m.type) ? m.type : "Doc",
            description: m.description || "AI generated resource",
            url: m.url || "#",
          }))
        : [];

      if (materials.length > 0) {
        const pdfIndex = materials.findIndex((m) => m.type === "PDF");
        const targetIndex = pdfIndex >= 0 ? pdfIndex : 0;
        const target = materials[targetIndex];
        const longDescription = buildTenLineDescription(
          subjectInput.trim(),
          levelInput.trim(),
          topicInput.trim(),
          target.description
        );
        const pdfUrl = generatePdfBlobUrl(target.title, longDescription);
        materials[targetIndex] = {
          ...target,
          type: "PDF",
          url: pdfUrl,
          longDescription,
          description: longDescription.join(" "),
        };
      }

      const section: MaterialSection = {
        id: crypto.randomUUID(),
        sectionTitle: data.sectionTitle || `${subjectInput} Materials`,
        subject: subjectInput.trim(),
        materials,
      };

      setSections((prev) => [section, ...prev]);
      toast.success("AI materials section generated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate materials");
    } finally {
      setGenerating(false);
    }
  };

  const handleOpen = (material: DisplayMaterial) => {
    if (material.url && material.url !== "#") {
      window.open(material.url, "_blank", "noopener,noreferrer");
      return;
    }
    setPreviewMaterial(material);
  };

  const handleDownload = (material: DisplayMaterial) => {
    if (material.type === "PDF" && material.url) {
      const a = document.createElement("a");
      a.href = material.url;
      a.download = `${material.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    const content = `Title: ${material.title}
Section: ${material.sectionTitle}
Subject: ${material.subject}
Type: ${material.type}

Description:
${material.description}

Reference URL:
${material.url}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${material.title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const startEdit = (material: DisplayMaterial) => {
    setEditingMaterial(material);
    setEditTitle(material.title);
    setEditType(material.type);
    setEditDescription(material.description);
    setEditUrl(material.url);
  };

  const saveEdit = () => {
    if (!editingMaterial) return;
    const nextDescription = editDescription.trim() || editingMaterial.description;
    const nextTitle = editTitle.trim() || editingMaterial.title;
    const longDescription =
      editType === "PDF"
        ? buildTenLineDescription(
            editingMaterial.subject,
            levelInput.trim() || "General Level",
            topicInput.trim(),
            nextDescription
          )
        : undefined;
    const nextUrl =
      editType === "PDF"
        ? generatePdfBlobUrl(nextTitle, longDescription || [nextDescription])
        : editUrl.trim() || "#";

    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        materials: section.materials.map((m) =>
          m.id === editingMaterial.id
            ? {
                ...m,
                title: nextTitle,
                type: editType,
                description:
                  editType === "PDF"
                    ? (longDescription || []).join(" ")
                    : nextDescription,
                longDescription,
                url: nextUrl,
              }
            : m
        ),
      }))
    );
    setEditingMaterial(null);
    toast.success("Material updated");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
        <p className="text-muted-foreground">
          {user?.role === "teacher"
            ? "Share and review class learning resources."
            : "Browse notes, links, and revision resources."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material-subject">Subject</Label>
              <Input
                id="material-subject"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                placeholder="e.g. Physics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-level">Class/Level</Label>
              <Input
                id="material-level"
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                placeholder="e.g. Grade 10"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={generateSection}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate with AI
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="material-topic">Topic Focus (optional)</Label>
            <Textarea
              id="material-topic"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Newton laws and numerical practice"
              rows={3}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search materials..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Button
                key={subject}
                size="sm"
                variant={subjectFilter === subject ? "default" : "outline"}
                onClick={() => setSubjectFilter(subject)}
              >
                {subject}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No materials yet. Generate your first AI section above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((material, idx) => {
            const Icon = typeIcon[material.type];
            return (
              <Card key={`${material.title}-${idx}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <Badge variant="secondary">{material.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Section: {material.sectionTitle}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {material.type === "PDF" && material.longDescription
                      ? material.longDescription.slice(0, 3).join(" ")
                      : material.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{material.subject}</Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpen(material)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        Open
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(material)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewMaterial?.title}</DialogTitle>
            <DialogDescription>
              Section: {previewMaterial?.sectionTitle} | Type: {previewMaterial?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {previewMaterial?.type === "PDF" && previewMaterial.longDescription ? (
              <div className="space-y-1">
                {previewMaterial.longDescription.map((line, idx) => (
                  <p key={idx}>
                    {idx + 1}. {line}
                  </p>
                ))}
              </div>
            ) : (
              <p>{previewMaterial?.description}</p>
            )}
            <p className="text-muted-foreground">
              No external URL provided. You can edit this material and add a URL.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update title, type, description, and URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={editType}
                onChange={(e) => setEditType(e.target.value as MaterialType)}
              >
                <option value="PDF">PDF</option>
                <option value="Link">Link</option>
                <option value="Doc">Doc</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button className="w-full" onClick={saveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
