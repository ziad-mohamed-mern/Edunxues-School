import { useState } from "react";
import { toast } from "sonner";
import {
  School,
  Globe,
  Bell,
  Moon,
  Save,
  Mail,
  Phone,
  MapPin,
  Languages,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GeneralSettings() {
  const [schoolName, setSchoolName] = useState("Edunexus Academy");
  const [schoolEmail, setSchoolEmail] = useState("admin@edunexus.edu");
  const [schoolPhone, setSchoolPhone] = useState("+1 (555) 000-0000");
  const [schoolAddress, setSchoolAddress] = useState("123 Education Blvd, Learning City");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground">
            Manage your institution's core configuration.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* School Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <CardTitle>School Profile</CardTitle>
            </div>
            <CardDescription>
              Basic information about your institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-email">
                <Mail className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Contact Email
              </Label>
              <Input
                id="school-email"
                type="email"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                placeholder="admin@school.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-phone">
                <Phone className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="school-phone"
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-address">
                <MapPin className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Address
              </Label>
              <Input
                id="school-address"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                placeholder="123 Education Blvd"
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <CardTitle>Localization</CardTitle>
            </div>
            <CardDescription>
              Language, timezone, and regional settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">
                <Languages className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="UTC+1">UTC+1 (West Africa)</SelectItem>
                  <SelectItem value="UTC+3">UTC+3 (East Africa)</SelectItem>
                  <SelectItem value="UTC-5">UTC-5 (Eastern US)</SelectItem>
                  <SelectItem value="UTC-8">UTC-8 (Pacific US)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure system-wide notification channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send alerts and updates via email.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Send urgent alerts via text message.
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card className="lg:col-span-2 border-destructive/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>System</CardTitle>
            </div>
            <CardDescription>
              Advanced system-wide settings. Use with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-3 bg-destructive/5 hover:bg-destructive/10 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-destructive">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Temporarily take the system offline for maintenance. Only admins can log in.
                </p>
              </div>
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={(val) => {
                  setMaintenanceMode(val);
                  if (val) toast.warning("Maintenance mode enabled!");
                  else toast.success("Maintenance mode disabled.");
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
