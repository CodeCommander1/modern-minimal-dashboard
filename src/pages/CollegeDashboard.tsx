import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Edit, Trash2, Plus } from "lucide-react";

function parseDdMmYyyyToMs(input: string): number | null {
  const m = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]) - 1;
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm, dd, 23, 59, 59, 999);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime();
}

export default function CollegeDashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Vacant seats data
  const mySeats = useQuery(api.dashboard.listMyVacantSeats);
  const createVacantSeat = useMutation(api.dashboard.createVacantSeat);
  const updateVacantSeat = useMutation(api.dashboard.updateVacantSeat);
  const deleteVacantSeat = useMutation(api.dashboard.deleteVacantSeat);

  // Applications & helpers
  const [filterBranch, setFilterBranch] = useState<string>("");
  const applications = useQuery(api.dashboard.listApplications, filterBranch ? { branch: filterBranch } : {});
  const seedApplications = useMutation(api.dashboard.seedApplications);

  // Merit lists
  const upsertMeritList = useMutation(api.dashboard.upsertMeritList);
  const meritLists = useQuery(api.dashboard.listMeritLists);

  // Announcements
  const createAnnouncement = useMutation(api.dashboard.createAnnouncement);
  const announcements = useQuery(api.dashboard.listAnnouncements);

  // Profile
  const updateCollegeProfile = useMutation(api.dashboard.updateCollegeProfile);

  // Redirect guard: colleges only; if student tries here, send to /dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = (typeof window !== "undefined" && localStorage.getItem("userRole")) || "student";
      if (role !== "college") navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Vacant seats dialog state
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vsCollegeName, setVsCollegeName] = useState(user?.collegeName || "");
  const [vsBranch, setVsBranch] = useState("");
  const [vsSeats, setVsSeats] = useState<string>("");
  const [vsLastDate, setVsLastDate] = useState("");
  const [vsNotes, setVsNotes] = useState("");

  const branchesFromSeats = useMemo(() => {
    const set = new Set<string>();
    (mySeats ?? []).forEach((s) => set.add(s.branch));
    return Array.from(set);
  }, [mySeats]);

  function openCreateSeat() {
    setEditingId(null);
    setVsCollegeName(user?.collegeName || "");
    setVsBranch("");
    setVsSeats("");
    setVsLastDate("");
    setVsNotes("");
    setSeatDialogOpen(true);
  }
  function openEditSeat(s: any) {
    setEditingId(s._id);
    setVsCollegeName(s.collegeName);
    setVsBranch(s.branch);
    setVsSeats(String(s.seats));
    const dt = new Date(s.lastDate);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = String(dt.getFullYear());
    setVsLastDate(`${dd}/${mm}/${yyyy}`);
    setVsNotes(s.notes || "");
    setSeatDialogOpen(true);
  }
  async function saveSeat() {
    const seatsNum = Number(vsSeats);
    const lastMs = parseDdMmYyyyToMs(vsLastDate);
    if (!vsCollegeName.trim() || !vsBranch.trim()) return toast.error("College name and Branch are required");
    if (!Number.isFinite(seatsNum) || seatsNum <= 0) return toast.error("Enter a valid number of seats");
    if (lastMs === null) return toast.error("Enter last date as DD/MM/YYYY");

    try {
      if (editingId) {
        await updateVacantSeat({
          id: editingId as any,
          collegeName: vsCollegeName,
          branch: vsBranch,
          seats: Math.floor(seatsNum),
          lastDate: lastMs,
          notes: vsNotes || undefined,
        });
        toast.success("Entry updated");
      } else {
        await createVacantSeat({
          collegeName: vsCollegeName,
          branch: vsBranch,
          seats: Math.floor(seatsNum),
          lastDate: lastMs,
          notes: vsNotes || undefined,
        });
        toast.success("Entry created");
      }
      setSeatDialogOpen(false);
    } catch {
      toast.error("Failed to save entry");
    }
  }
  async function removeSeat(id: string) {
    try {
      await deleteVacantSeat({ id: id as any });
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  // Applications helpers
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minRankFilter, setMinRankFilter] = useState<string>("");

  const filteredApplications = useMemo(() => {
    let list = applications ?? [];
    if (categoryFilter.trim()) {
      list = list.filter((a: any) => (a.category || "").toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    if (minRankFilter.trim()) {
      const n = Number(minRankFilter);
      if (Number.isFinite(n)) list = list.filter((a: any) => a.meritRank <= n);
    }
    return list;
  }, [applications, categoryFilter, minRankFilter]);

  // Merit list form
  const [mlBranch, setMlBranch] = useState("");
  const [mlDetails, setMlDetails] = useState("");

  async function handleSaveMeritList() {
    if (!mlBranch.trim() || !mlDetails.trim()) return toast.error("Branch and details are required");
    try {
      await upsertMeritList({ branch: mlBranch.trim(), details: mlDetails.trim() });
      toast.success("Merit list saved");
      setMlDetails("");
    } catch {
      toast.error("Failed to save merit list");
    }
  }

  // Announcements
  const [annBranch, setAnnBranch] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  async function handleCreateAnnouncement() {
    if (!annMessage.trim()) return toast.error("Message is required");
    try {
      await createAnnouncement({ message: annMessage.trim(), branch: annBranch.trim() || undefined });
      toast.success("Announcement sent");
      setAnnMessage("");
    } catch {
      toast.error("Failed to send");
    }
  }

  // Profile & settings
  const [collegeName, setCollegeName] = useState(user?.collegeName || "");
  const [collegeLogoUrl, setCollegeLogoUrl] = useState(user?.collegeLogoUrl || "");
  const [collegeContactInfo, setCollegeContactInfo] = useState(user?.collegeContactInfo || "");
  useEffect(() => {
    setCollegeName(user?.collegeName || "");
    setCollegeLogoUrl(user?.collegeLogoUrl || "");
    setCollegeContactInfo(user?.collegeContactInfo || "");
  }, [user?.collegeName, user?.collegeLogoUrl, user?.collegeContactInfo]);

  async function handleSaveProfile() {
    try {
      await updateCollegeProfile({
        collegeName: collegeName || undefined,
        collegeLogoUrl: collegeLogoUrl || undefined,
        collegeContactInfo: collegeContactInfo || undefined,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  // ADD: Place the guard here so all hooks above run every render
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">College Dashboard</h1>
          <p className="text-muted-foreground">Manage seats, applications, merit lists, and announcements.</p>
        </div>

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="seats">Manage Vacant Seats</TabsTrigger>
            <TabsTrigger value="applications">View Applications</TabsTrigger>
            <TabsTrigger value="merit">Update Merit List</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="profile">Profile & Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="mt-6">
            <Card className="p-6 space-y-3">
              <p className="font-semibold">Instructions for College Admin</p>
              <p className="text-sm text-muted-foreground">
                Please enter the details of vacant seats for each branch. This information will be visible to students applying through the merit list.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Required Inputs:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>College Name</li>
                  <li>Branch/Department (e.g., Computer Science, Mechanical, Commerce, Arts, etc.)</li>
                  <li>Number of Vacant Seats</li>
                  <li>Last Date to Apply (DD/MM/YYYY)</li>
                  <li>Additional Notes (optional) – e.g., reservation details, eligibility, counseling rounds</li>
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Example Input Format:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>College Name: XYZ Institute of Technology</li>
                  <li>Branch: Computer Science Engineering</li>
                  <li>Vacant Seats: 12</li>
                  <li>Last Date to Apply: 30/09/2025</li>
                  <li>Notes: Merit list cutoff will be displayed on 25/09/2025</li>
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">System Behavior:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Each entry will be stored branch-wise.</li>
                  <li>Students will see available seats and deadlines in real-time.</li>
                  <li>Once the last date is over, the seat entry will auto-expire (marked as closed).</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="seats" className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-muted-foreground">Create and manage branch-wise seat availability.</p>
              <Button size="sm" onClick={openCreateSeat}>
                <Plus className="h-4 w-4 mr-2" /> Add Entry
              </Button>
            </div>
            <div className="grid gap-3">
              {(mySeats ?? []).map((s) => {
                const closed = s.lastDate < Date.now();
                return (
                  <div key={s._id} className="rounded-md border p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{s.branch}</div>
                      <div className={`text-xs ${closed ? "text-red-500" : "text-green-600"}`}>{closed ? "Closed" : "Open"}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{s.collegeName}</div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>Seats: {s.seats}</span>
                      <span>Last Date: {new Date(s.lastDate).toLocaleDateString()}</span>
                    </div>
                    {s.notes && <p className="text-[11px] text-muted-foreground mt-1">{s.notes}</p>}
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => openEditSeat(s)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeSeat(s._id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
              {(mySeats ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No entries yet. Click "Add Entry" to create one.</p>
              )}
            </div>

            <Dialog open={seatDialogOpen} onOpenChange={setSeatDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Vacant Seats" : "Add Vacant Seats"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">College Name</label>
                    <Input value={vsCollegeName} onChange={(e) => setVsCollegeName(e.target.value)} placeholder="XYZ Institute of Technology" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Branch/Department</label>
                    <Input value={vsBranch} onChange={(e) => setVsBranch(e.target.value)} placeholder="Computer Science, Mechanical, Commerce, Arts..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Vacant Seats</label>
                      <Input inputMode="numeric" value={vsSeats} onChange={(e) => setVsSeats(e.target.value.replace(/[^\d]/g, ""))} placeholder="12" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Last Date (DD/MM/YYYY)</label>
                      <Input value={vsLastDate} onChange={(e) => setVsLastDate(e.target.value)} placeholder="30/09/2025" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Additional Notes (optional)</label>
                    <Textarea value={vsNotes} onChange={(e) => setVsNotes(e.target.value)} placeholder="Reservation details, eligibility, counseling rounds..." />
                  </div>
                </div>
                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSeatDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveSeat}>{editingId ? "Update" : "Save"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <Card className="p-4 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Filter by Branch</label>
                  <Input placeholder="e.g., Computer Science" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Filter by Category</label>
                  <Input placeholder="e.g., General, OBC" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max Merit Rank</label>
                  <Input inputMode="numeric" placeholder="e.g., 50" value={minRankFilter} onChange={(e) => setMinRankFilter(e.target.value.replace(/[^\d]/g, ""))} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">View student applications by branch.</p>
                <Button size="sm" variant="outline" onClick={async () => { await seedApplications({}); toast.success("Sample applications added"); }}>
                  Add Sample Applications
                </Button>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {filteredApplications.map((a: any) => (
                  <div key={a._id} className="rounded-md border p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{a.studentName}</span>
                      <span className="text-xs">Rank: {a.meritRank}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Branch: {a.branch} • Category: {a.category || "—"}</div>
                    {(a.contactEmail || a.contactPhone) && (
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {a.contactEmail ? `Email: ${a.contactEmail}` : ""} {a.contactPhone ? `• Phone: ${a.contactPhone}` : ""}
                      </div>
                    )}
                    {a.notes && <div className="text-[11px] text-muted-foreground mt-1">{a.notes}</div>}
                  </div>
                ))}
                {filteredApplications.length === 0 && <p className="text-sm text-muted-foreground">No applications found.</p>}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="merit" className="mt-6">
            <Card className="p-4 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs text-muted-foreground">Branch</label>
                  <Input placeholder="e.g., Computer Science" value={mlBranch} onChange={(e) => setMlBranch(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Merit List Details</label>
                  <Textarea placeholder="Paste or write merit list details here..." value={mlDetails} onChange={(e) => setMlDetails(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveMeritList}>Save Merit List</Button>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Existing Merit Lists</p>
                <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
                  {(meritLists ?? []).map((m: any) => (
                    <div key={m._id} className="rounded-md border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{m.branch}</span>
                        <span className="text-xs text-muted-foreground">Updated: {new Date(m.lastUpdated).toLocaleString()}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-xs mt-1">{m.details}</pre>
                    </div>
                  ))}
                  {(meritLists ?? []).length === 0 && <p className="text-sm text-muted-foreground">No merit lists yet.</p>}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            <Card className="p-4 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Target Branch (optional)</label>
                  <Input placeholder="e.g., Computer Science (leave blank for all)" value={annBranch} onChange={(e) => setAnnBranch(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Announcement Message</label>
                  <Textarea placeholder="Type an announcement..." value={annMessage} onChange={(e) => setAnnMessage(e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Recent Announcements</p>
                <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
                  {(announcements ?? []).map((a: any) => (
                    <div key={a._id} className="rounded-md border p-3 text-sm">
                      <div className="flex justify-between">
                        <span>{a.message}</span>
                        <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {a.branch ? `Branch: ${a.branch}` : "All branches"}
                      </div>
                    </div>
                  ))}
                  {(announcements ?? []).length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card className="p-4 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">College Name</label>
                  <Input value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="e.g., XYZ Institute of Technology" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">College Logo URL</label>
                  <Input value={collegeLogoUrl} onChange={(e) => setCollegeLogoUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Contact Info</label>
                  <Input value={collegeContactInfo} onChange={(e) => setCollegeContactInfo(e.target.value)} placeholder="Email/Phone/Address" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {collegeLogoUrl && <img src={collegeLogoUrl} alt="logo" className="h-10 w-10 rounded-md object-cover border" />}
                  <div className="text-sm">
                    <div className="font-medium">{collegeName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{collegeContactInfo || "—"}</div>
                  </div>
                </div>
                <Button onClick={handleSaveProfile}>Save Profile</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}