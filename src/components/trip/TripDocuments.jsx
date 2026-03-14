import { useState, useEffect, useRef } from "react";
import {
  fetchDocuments,
  createDocument,
  deleteDocument,
} from "@/api/documentApi";


import {
  FileText,
  Plus,
  Trash2,
  Download,
  Upload,
  Eye,
  Check
} from "lucide-react";

import { toast } from "sonner";
const docTypes = [
  "🎫 Flight Ticket",
  "🏨 Hotel Confirmation",
  "🪪 ID/Passport",
  "🧾 Insurance",
  "📋 Visa",
  "📄 Other",
];

const TripDocuments = ({ tripId, userId }) => {
  const [docs, setDocs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: docTypes[0],
    content: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    const res = await fetchDocuments(tripId);
    setDocs(res.data || []);
  };

  useEffect(() => {
    load();
  }, [tripId]);

const addDoc = async (e) => {

  e.preventDefault();

  setUploading(true);

  try {

    const formData = new FormData();

    formData.append("trip_id", tripId); // FIXED
    formData.append("name", form.name);
    formData.append("type", form.type);
    formData.append("content", form.content);

    if (file) {
      formData.append("file", file);
    }

    await createDocument(formData);

    await load();

    setForm({
      name: "",
      type: docTypes[0],
      content: ""
    });

    setFile(null);

    setShowAdd(false);

    toast.success("Document saved!");

  } catch (err) {

    toast.error(
      err.response?.data?.error || "Upload failed"
    );

  } finally {

    setUploading(false);

  }

};

  const deleteDoc = async (doc) => {
    await deleteDocument(doc.id);
    await load();
    toast.success("Document deleted");
  };

  const viewFile = (doc) => {
    if (!doc.file_url) {
      toast.error("No file attached to this document");
      return;
    }
    window.open(doc.file_url, "_blank");
  };

  const downloadDoc = async (doc) => {
    if (!doc.file_url) {
      toast.error("No file attached to this document");
      return;
    }
    try {
      toast.loading("Downloading...", { id: "doc-dl" });
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Downloaded!", { id: "doc-dl" });
    } catch {
      toast.error("Download failed", { id: "doc-dl" });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Trip Documents</h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium">Keep your essential records secure</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-saas-primary py-3 sm:py-4 px-4 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] animate-pulse-subtle">
          <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileText className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-medium">No documents uploaded for this trip</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="text-primary font-bold mt-2 hover:underline"
          >
            Upload a ticket or reservation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="glass-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between group hover:shadow-xl transition-all duration-300 min-h-[160px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 glass-card rounded-2xl flex items-center justify-center text-xl sm:text-2xl border-white/60">
                    {doc.type.split(" ")[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground text-sm sm:text-base truncate">{doc.name}</h4>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                      {doc.type.split(" ")[1] || doc.type}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => deleteDoc(doc)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  {doc.file_url && (
                    <button
                      onClick={() => viewFile(doc)}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
                    >
                      VIEW FILE
                    </button>
                  )}
                  <button
                    onClick={() => downloadDoc(doc)}
                    className="p-2 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-all"
                  >
                    <Download size={14} />
                  </button>
                </div>
                {doc.content && (
                  <span className="text-[10px] font-bold text-muted-foreground/60 italic">Has Notes</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-card rounded-[2.5rem] p-6 sm:p-10 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Vault Entry</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Securely store your travel papers for offline access.</p>
            </div>

            <form onSubmit={addDoc} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Document Name</label>
                <input
                  autoFocus
                  placeholder="e.g. Paris Flight Ticket"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input-saas"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Category</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-saas appearance-none"
                  >
                    {docTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:pt-6">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`h-[48px] sm:h-[52px] border-2 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      file ? "bg-primary/5 border-primary text-primary" : "border-muted-foreground/20 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {file ? <Check size={16} /> : <Upload size={16} />}
                    <span className="text-[10px] font-bold truncate max-w-[100px]">
                      {file ? file.name : "ATTACH FILE"}
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">Quick Notes</label>
                <textarea
                  placeholder="Confirmation numbers, booking IDs..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={2}
                  className="input-saas min-h-[80px] py-3 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setFile(null);
                  }}
                  className="btn-saas-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-saas-primary flex-1 disabled:opacity-50"
                >
                  {uploading ? "Syncing..." : "Secure Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDocuments;
