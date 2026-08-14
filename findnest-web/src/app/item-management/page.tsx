"use client";
import { useState, useMemo, useEffect } from "react";
import api from "@/lib/api";

type ItemStatus = "unclaimed" | "claimed" | "for_disposal" | "confiscated";

interface FoundItem {
  id: number;
  item_name: string;
  category: string;
  location_found: string;
  storage_location: string;
  status: ItemStatus;
  photo_url: string | null;
  description: string | null;
  date_found: string | null;
}

const CATEGORY_OPTIONS = [
  "Electronics",
  "Personal Belongings",
  "ID/Cards",
  "Keys",
  "School Supplies",
  "Accessories",
  "Books",
  "Vapes",
  "Others",
];

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "unclaimed", label: "Unclaimed" },
  { value: "claimed", label: "Claimed" },
  { value: "for_disposal", label: "For Disposal" },
  { value: "confiscated", label: "Confiscated" },
];

const PAGE_SIZE = 5;

function statusStyles(status: ItemStatus) {
  switch (status) {
    case "claimed":
      return { dot: "bg-green-500", badge: "bg-green-50 text-green-700", label: "Claimed" };
    case "unclaimed":
      return { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700", label: "Unclaimed" };
    case "confiscated":
      return { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700", label: "Confiscated" };
    case "for_disposal":
    default:
      return { dot: "bg-red-500", badge: "bg-red-50 text-red-600", label: "For Disposal" };
  }
}

export default function ItemManagement() {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showLogModal, setShowLogModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<FoundItem | null>(null);
  const [editingItem, setEditingItem] = useState<FoundItem | null>(null);
  const [disposingItem, setDisposingItem] = useState<FoundItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORY_OPTIONS[0]);
  const [formLocationFound, setFormLocationFound] = useState("");
  const [formStorageLocation, setFormStorageLocation] = useState("");
  const [formDateFound, setFormDateFound] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<ItemStatus>("unclaimed");
  const [formPhotoUrl, setFormPhotoUrl] = useState<string | null>(null);
  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null);
  const [formUploading, setFormUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchItems = async () => {
    try {
      const res = await api.get("/found-items");
      setItems(res.data.records || []);
    } catch (err) {
      console.error("Error fetching found items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.item_name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.storage_location || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const unclaimedCount = items.filter((i) => i.status === "unclaimed").length;
  const claimedCount = items.filter((i) => i.status === "claimed").length;
  const disposalCount = items.filter((i) => i.status === "for_disposal").length;

  function resetForm() {
    setFormName("");
    setFormCategory(CATEGORY_OPTIONS[0]);
    setFormLocationFound("");
    setFormStorageLocation("");
    setFormDateFound("");
    setFormDescription("");
    setFormStatus("unclaimed");
    setFormPhotoUrl(null);
    setFormPhotoPreview(null);
    setFormError("");
    setFormUploading(false);
    setFormLoading(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormPhotoPreview(URL.createObjectURL(file));
    setFormUploading(true);
    setFormPhotoUrl(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "found-items");
      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormPhotoUrl(res.data.url);
    } catch (err) {
      console.error("Photo upload failed:", err);
      setFormPhotoPreview(null);
      alert("Photo upload failed. Please try again.");
    } finally {
      setFormUploading(false);
    }
  }

  async function handleLogSubmit() {
    if (!formName.trim() || !formLocationFound.trim() || !formDateFound) {
      setFormError("Item name, location found, and date found are required.");
      return;
    }
    setFormError("");
    setFormLoading(true);
    try {
      await api.post("/found-items", {
        item_name: formName.trim(),
        category: formCategory,
        description: formDescription.trim() || null,
        location_found: formLocationFound.trim(),
        date_found: formDateFound,
        photo_url: formPhotoUrl,
        storage_location: formStorageLocation.trim() || null,
      });
      setShowLogModal(false);
      resetForm();
      setPage(1);
      setToast(`${formName.trim()} was logged as a found item.`);
      fetchItems();
    } catch (err: any) {
      setFormError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(", ") || "Failed to log item.");
    } finally {
      setFormLoading(false);
    }
  }

  function openEditModal(item: FoundItem) {
    setFormName(item.item_name);
    setFormCategory(item.category);
    setFormLocationFound(item.location_found);
    setFormStorageLocation(item.storage_location || "");
    setFormDateFound(item.date_found || "");
    setFormDescription(item.description || "");
    setFormStatus(item.status);
    setFormPhotoUrl(item.photo_url);
    setFormPhotoPreview(item.photo_url);
    setFormError("");
    setEditingItem(item);
  }

  async function handleEditSubmit() {
    if (!editingItem) return;
    if (!formName.trim() || !formLocationFound.trim()) {
      setFormError("Item name and location found are required.");
      return;
    }
    setFormError("");
    setFormLoading(true);
    try {
      await api.put(`/found-items/${editingItem.id}`, {
        item_name: formName.trim(),
        category: formCategory,
        description: formDescription.trim() || null,
        location_found: formLocationFound.trim(),
        date_found: formDateFound,
        photo_url: formPhotoUrl,
        storage_location: formStorageLocation.trim() || null,
        status: formStatus,
      });
      setToast(`${formName.trim()} was updated.`);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to update item.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDisposeConfirm() {
    if (!disposingItem) return;
    const nextStatus: ItemStatus = disposingItem.status === "for_disposal" ? "unclaimed" : "for_disposal";
    try {
      await api.put(`/found-items/${disposingItem.id}`, { status: nextStatus });
      setToast(
        nextStatus === "for_disposal"
          ? `${disposingItem.item_name} was marked for disposal.`
          : `${disposingItem.item_name} was restored from disposal.`
      );
      setDisposingItem(null);
      fetchItems();
    } catch (err) {
      console.error("Error updating item status:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {toast && (
        <div className="fixed top-6 right-6 z-[200] bg-[#1a237e] text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      <aside className="w-72 bg-[#1a237e] min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
        <div className="flex items-center gap-3 px-6 py-6">
          <div>
            <a href="/dashboard" className="text-white font-black text-lg block">
              FIND<span className="text-[#ffd700]">NEST</span>
            </a>
            <span className="text-blue-300 text-xs">Admin Panel</span>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/10 mb-4" />

        <nav className="flex flex-col gap-1 px-4 flex-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">Main Menu</p>
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Dashboard</span>
          </a>
          <a href="/item-management" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-semibold border border-white/20">
            <span>Item Management</span>
          </a>
          <a href="/claim-verification" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Claim Verification</span>
          </a>
          <a href="/location-analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Location Analytics</span>
          </a>
          <a href="/digital-records" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Digital Records</span>
          </a>
          <a href="/ai-matching" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Assistive AI Matching</span>
          </a>
          <a href="/admin-audit-trail" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Audit Trail</span>
          </a>
          <a href="/admin-support" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium">
            <span>Support Inbox</span>
          </a>
        </nav>

        <div className="px-4 py-6">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white text-sm font-semibold">Guidance Counselor</p>
            <p className="text-blue-300 text-xs mt-1">Administrator</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem("findnest_token"); localStorage.removeItem("findnest_user"); window.location.href = "/"; }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition font-medium w-full text-left"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a237e]">Item Management</h1>
            <p className="text-gray-400 text-sm mt-1">Review, approve and manage all lost and found item reports</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowLogModal(true); }}
            className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#283593] text-white font-bold px-6 py-3 rounded-2xl transition shadow-lg hover:-translate-y-0.5 transform"
          >
            + Log New Found Item
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Unclaimed Items</p>
            <p className="text-4xl font-black text-[#1a237e] mt-1">{unclaimedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">Claimed Items</p>
            <p className="text-4xl font-black text-green-600 mt-1">{claimedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm font-medium">For Disposal</p>
            <p className="text-4xl font-black text-red-500 mt-1">{disposalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-700 text-lg">All Items</h2>
            <input
              type="text"
              placeholder="Search by name, category, or location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm w-72"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading items...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Photo</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item Name</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Storage Location</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((item) => {
                  const styles = statusStyles(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.item_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-700">{item.item_name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">ID: ITM-{String(item.id).padStart(3, "0")}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-500 text-sm">{item.storage_location || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${styles.badge}`}>{styles.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewingItem(item)} className="bg-blue-50 hover:bg-[#1a237e] hover:text-white text-[#1a237e] text-xs font-bold px-3 py-1.5 rounded-lg transition">View</button>
                          <button onClick={() => openEditModal(item)} className="bg-yellow-50 hover:bg-yellow-500 hover:text-white text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-lg transition">Edit</button>
                          <button
                            onClick={() => setDisposingItem(item)}
                            className={item.status === "for_disposal"
                              ? "bg-green-50 hover:bg-green-600 hover:text-white text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                              : "bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                            }
                          >
                            {item.status === "for_disposal" ? "Restore" : "Dispose"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold text-lg">No items found</p>
              <p className="text-sm mt-1">Try searching with a different keyword</p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} items
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={p === page ? "px-3 py-1.5 bg-[#1a237e] rounded-lg text-white text-sm font-bold" : "px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition"}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-sm hover:border-[#1a237e] hover:text-[#1a237e] transition disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </main>

      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setShowLogModal(false); resetForm(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none">&times;</button>
            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Log New Found Item</h2>
            <p className="text-gray-400 text-sm mb-6">Record an item that was physically surrendered to the office</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Photo (Optional)</label>
                <label className="mt-1 block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 hover:border-[#1a237e] rounded-xl p-4 text-center transition">
                    {formUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </div>
                    ) : formPhotoPreview ? (
                      <div>
                        <img src={formPhotoPreview} alt="Preview" className="max-h-32 mx-auto rounded-xl" />
                        {formPhotoUrl && <p className="text-green-600 text-xs font-bold mt-2">Uploaded successfully</p>}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-xs">Click to upload a photo</p>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Item Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Grey Backpack" className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm">
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location Found</label>
                <input type="text" value={formLocationFound} onChange={(e) => setFormLocationFound(e.target.value)} placeholder="e.g. Near the canteen" className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date Found</label>
                <input type="date" value={formDateFound} onChange={(e) => setFormDateFound(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Storage Location (Optional)</label>
                <input type="text" value={formStorageLocation} onChange={(e) => setFormStorageLocation(e.target.value)} placeholder="e.g. Cabinet A-08" className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description (Optional)</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Describe the item..." rows={2} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm resize-none" />
              </div>
              {formError && <p className="text-red-500 text-xs font-semibold">{formError}</p>}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setShowLogModal(false); resetForm(); }} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleLogSubmit} disabled={formLoading || formUploading} className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition disabled:opacity-50">
                {formLoading ? "Logging..." : "Log Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            <button onClick={() => setViewingItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none">&times;</button>
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-5 flex items-center justify-center">
              {viewingItem.photo_url ? (
                <img src={viewingItem.photo_url} alt={viewingItem.item_name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-sm">No Photo Available</div>
              )}
            </div>
            <h2 className="text-xl font-black text-[#1a237e]">{viewingItem.item_name}</h2>
            <p className="text-gray-400 text-xs mb-4">ID: ITM-{String(viewingItem.id).padStart(3, "0")}</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Category</span>
                <span className="font-bold text-gray-700">{viewingItem.category}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Location Found</span>
                <span className="font-bold text-gray-700">{viewingItem.location_found}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Storage Location</span>
                <span className="font-bold text-gray-700">{viewingItem.storage_location || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Date Found</span>
                <span className="font-bold text-gray-700">{viewingItem.date_found || "—"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 font-medium">Status</span>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusStyles(viewingItem.status).badge}`}>{statusStyles(viewingItem.status).label}</span>
              </div>
              {viewingItem.description && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 font-medium text-sm block mb-1">Description</span>
                  <span className="font-bold text-gray-700 text-sm">{viewingItem.description}</span>
                </div>
              )}
            </div>
            <button onClick={() => setViewingItem(null)} className="w-full mt-6 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition">Close</button>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setEditingItem(null); resetForm(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-bold leading-none">&times;</button>
            <h2 className="text-2xl font-black text-[#1a237e] mb-1">Edit Item</h2>
            <p className="text-gray-400 text-sm mb-6">Update {editingItem.item_name}&apos;s record</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Item Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm">
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location Found</label>
                <input type="text" value={formLocationFound} onChange={(e) => setFormLocationFound(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Storage Location</label>
                <input type="text" value={formStorageLocation} onChange={(e) => setFormStorageLocation(e.target.value)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as ItemStatus)} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm">
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-gray-700 text-sm resize-none" />
              </div>
              {formError && <p className="text-red-500 text-xs font-semibold">{formError}</p>}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setEditingItem(null); resetForm(); }} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleEditSubmit} disabled={formLoading} className="flex-1 bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-3 rounded-2xl transition disabled:opacity-50">
                {formLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {disposingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1757]/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <h2 className="text-xl font-black text-[#1a237e] mb-2">
              {disposingItem.status === "for_disposal" ? "Restore This Item?" : "Mark for Disposal?"}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {disposingItem.status === "for_disposal"
                ? `${disposingItem.item_name} will be moved back to Unclaimed.`
                : `${disposingItem.item_name} will be flagged for disposal and removed from active search results.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDisposingItem(null)} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition">Cancel</button>
              <button
                onClick={handleDisposeConfirm}
                className={`flex-1 text-white font-bold py-3 rounded-2xl transition ${disposingItem.status === "for_disposal" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}
              >
                {disposingItem.status === "for_disposal" ? "Restore" : "Dispose"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}