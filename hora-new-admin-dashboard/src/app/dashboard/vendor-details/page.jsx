"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { BASE_URL, MEDIA_PROCESSING_BASE_URL } from "../../../utils/apiconstant";
import "./editVendor.css";
import { getSocket } from "../../../../socket";


const CHUNK_SIZE = 25 * 1024 * 1024;
const CHUNK_CONCURRENCY = 3;
const MAX_RETRIES = 3;
const CITIES = ["Mumbai", "Bangalore", "Delhi", "Hyderabad"];
const PAGE_SIZE = 24; 
const isVideoUrl = (url = "") => /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(url);

const getAuthToken = () =>
    typeof window === "undefined" ? "" : localStorage.getItem("token") || "";

const uid = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2);

const getExt = (name) => {
    const i = name.lastIndexOf(".");
    return i !== -1 ? name.slice(i).toLowerCase() : "";
};

const putChunk = (url, blob, contentType) =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
                ? resolve(xhr.getResponseHeader("ETag"))
                : reject(new Error(`HTTP ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(blob);
    });

const putWithRetry = async (chunk, contentType) => {
    for (let attempt = 0; ; attempt++) {
        try {
            return await putChunk(chunk.url, chunk.blob, contentType);
        } catch (err) {
            if (attempt >= MAX_RETRIES)
                throw new Error(`Part ${chunk.partNumber} failed: ${err.message}`);
            await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        }
    }
};

const belongsToFolder = (photo, folderId) => {
    const id = String(folderId);
    return (
        (Array.isArray(photo.folderIds) && photo.folderIds.map(String).includes(id)) ||
        String(photo.fileId || "").startsWith(`${id}_`)
    );
};


const GridVideo = ({ src }) => {
    const ref = useRef(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            setShow(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => setShow(entry.isIntersecting),
            { rootMargin: "200px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <video
            ref={ref}
            src={show ? src : undefined}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
        />
    );
};

const Modal = ({ open, title, onClose, children, wide }) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="ed-overlay" onClick={onClose}>
            <div
                className={`ed-modal ${wide ? "ed-modal-wide" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ed-modal-head">
                    <h3>{title}</h3>
                    <button className="ed-icon-btn" onClick={onClose}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const EditVendorDetails = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const id = searchParams.get("id") || "";
    const phone = searchParams.get("phone") || "";

    console.log("Vendor ID:", id);
    console.log("Phone:", phone);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(null); 
    const [toast, setToast] = useState("");

    const [form, setForm] = useState({ name: "", age: "", experience: "", city: "", avatar: "" });
    const [aboutText, setAboutText] = useState("");
    const [allSpecs, setAllSpecs] = useState([]);
    const [selectedSpecs, setSelectedSpecs] = useState([]);

    const [subFolders, setSubFolders] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [activeFolder, setActiveFolder] = useState(null);

    const [folderCovers, setFolderCovers] = useState({});
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const activeFolderRef = useRef(null);

    const [newFolderName, setNewFolderName] = useState("");
    const [previewIndex, setPreviewIndex] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [uploadInfo, setUploadInfo] = useState({ total: 0, completed: 0, failed: 0 });
    const [videoPercent, setVideoPercent] = useState(0);
    const [currentFile, setCurrentFile] = useState(null); 
    const [pendingItems, setPendingItems] = useState([]);

    const updatePending = (key, status) =>
        setPendingItems((prev) => prev.map((i) => (i.key === key ? { ...i, status } : i)));

    const clearPending = (folderId) =>
        setPendingItems((prev) => {
            prev.filter((i) => i.folderId === folderId).forEach((i) => URL.revokeObjectURL(i.url));
            return prev.filter((i) => i.folderId !== folderId);
        });
    const fileInputRef = useRef(null);
    const toastTimer = useRef(null);

    const folderName = `recentWork_${id}`;

    const showToast = (msg) => {
        setToast(msg);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(""), 3500);
    };

    const ensureRecentWorkFolder = useCallback(async () => {
        try {
            await fetch(`${BASE_URL}/api/photo/CreateFolder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folderName, customerId: id, vendorId: id }),
            });
        } catch (e) {
            console.error("Recent work folder error:", e);
        }
    }, [folderName, id]);

    const fetchThumbnails = useCallback(async () => {
        try {
            const res = await fetch(
                `${BASE_URL}/api/photo/thumbnailsWithinProject?folderName=${encodeURIComponent(folderName)}`
            );
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to fetch photos");

            const main = (result.folders || []).find((f) => f.folderName === folderName);
            const subs = main?.subFolders || [];
            const all = result.thumbnails || [];

            setSubFolders(subs);

            const covers = {};
            subs.forEach((f) => {
                const c = all.find((p) => {
                    if (!belongsToFolder(p, f._id)) return false;
                    if (p.type === "video") return false;
                    return !isVideoUrl(p.originalUrl || p.thumbnailImageUrl || "");
                });
                covers[f._id] = c?.thumbnailImageUrl || c?.originalUrl || "";
            });
            setFolderCovers(covers);

            let target = activeFolderRef.current;
            if (!target && subs.length > 0) {
                const first = subs.find((f) => all.some((p) => belongsToFolder(p, f._id)));
                target = (first || subs[0])._id;
                activeFolderRef.current = target;
                setActiveFolder(target);
            }

            setPhotos(target ? all.filter((p) => belongsToFolder(p, target)) : []);
        } catch (e) {
            console.error("Thumbnails error:", e);
        }
    }, [folderName]);

    const selectFolder = (folderId) => {
        if (folderId === activeFolderRef.current) return;
        activeFolderRef.current = folderId;
        setActiveFolder(folderId);
        setPhotos([]); 
        setVisibleCount(PAGE_SIZE);
        setPreviewIndex(null);
        fetchThumbnails();
    };

    const fetchProfile = useCallback(async () => {
        try {
            const [uRes, sRes] = await Promise.all([
                fetch(`${BASE_URL}/api/users/user_details/${id}?phone=${encodeURIComponent(phone)}`),
                fetch(`${BASE_URL}/api/specializations/get`),
            ]);
            const uJson = await uRes.json();
            const sJson = await sRes.json();

            if (uJson.status === 200) {
                const u = uJson.data;
                setUser(u);
                setForm({
                    name: u.name || "",
                    age: u.age || "",
                    experience: u.experience || "",
                    city: u.city || "",
                    avatar: "",
                });
                setAboutText(u.about || "");
                setSelectedSpecs(u.userSpecializations || []);
            }
            if (sJson.status === 200) setAllSpecs(sJson.data || []);
        } catch (e) {
            console.error("Profile error:", e);
        }
    }, [id, phone]);


    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onDone = ({ file }) => {
            if (!file) return;

            const real = {
                ...file,
                thumbnailImageUrl: file.thumbnailImageUrl || file.originalUrl,
            };

            if (!activeFolderRef.current || !belongsToFolder(file, activeFolderRef.current)) return;

            setPhotos((prev) => {
                const exists = prev.some(
                    (p) => String(p._id) === String(file._id) || p.fileId === file.fileId
                );
                if (exists) {
                    return prev.map((p) =>
                        String(p._id) === String(file._id) || p.fileId === file.fileId ? real : p
                    );
                }
                return [real, ...prev];
            });
        };

        socket.on("media:done", onDone);
        return () => socket.off("media:done", onDone);
    }, []);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            await fetchProfile();
            await ensureRecentWorkFolder();
            await fetchThumbnails();
            setLoading(false);
        })();
    }, [id, fetchProfile, ensureRecentWorkFolder, fetchThumbnails]);

    const filteredPhotos = useMemo(
        () => (activeFolder ? photos.filter((p) => belongsToFolder(p, activeFolder)) : []),
        [photos, activeFolder]
    );

    const visiblePhotos = useMemo(
        () => filteredPhotos.slice(0, visibleCount),
        [filteredPhotos, visibleCount]
    );

    const pendingForActive = useMemo(
        () => pendingItems.filter((i) => i.folderId === activeFolder),
        [pendingItems, activeFolder]
    );

    const postUpdate = async (payload) => {
        const res = await fetch(`${BASE_URL}/api/users/supplier_personal_details_update/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || result.error) throw new Error(result.message || "Update failed");
    };

    const saveDetails = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                name: form.name,
                age: form.age,
                experience: form.experience,
                city: form.city,
            };
            if (form.avatar) payload.avatar = form.avatar;
            await postUpdate(payload);
            setModal(null);
            await fetchProfile();
            showToast("Details updated");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return alert("Please select an image file");
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("image", file);
            const res = await fetch(`${BASE_URL}/api/user/user-avatar/${user._id}`, {
                method: "PUT",
                body: fd,
            });
            const result = await res.json();
            if (!res.ok || result.error) throw new Error(result.message || "Upload failed");
            const url = result?.data?.avatar;
            if (!url) throw new Error("Avatar URL not received");
            setForm((f) => ({ ...f, avatar: url }));
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
            e.target.value = "";
        }
    };

    const saveAbout = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await postUpdate({ about: aboutText });
            setModal(null);
            await fetchProfile();
            showToast("About updated");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleSpec = (sid) =>
        setSelectedSpecs((prev) =>
            prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
        );

    const saveSpecs = async () => {
        try {
            setSaving(true);
            const res = await fetch(`${BASE_URL}/api/specializations/user/specializations`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?._id, userSpecializations: selectedSpecs }),
            });
            const result = await res.json();
            if (!res.ok || result.error) throw new Error(result.message || "Update failed");
            setModal(null);
            await fetchProfile();
            showToast("Specializations updated");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const selectedSpecList = allSpecs.filter((s) => selectedSpecs.includes(s._id));

    const createSubFolder = async (e) => {
        e.preventDefault();
        const name = newFolderName.trim();
        if (!name) return;
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("folderName", folderName);
            fd.append("type", "others");
            fd.append("userId", id);
            fd.append("phoneNo", phone);
            fd.append("subFolderName", name);

            const res = await fetch(`${MEDIA_PROCESSING_BASE_URL}/create-subfolder`, { method: "POST", body: fd });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Folder creation failed");

            setNewFolderName("");
            setModal(null);
            await fetchThumbnails();
            showToast("Folder created");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const uploadImage = async (file) => {
        const token = getAuthToken();
        const fileName = `${activeFolder}_${uid()}${getExt(file.name)}`;

        const { data } = await axios.post(
            `${MEDIA_PROCESSING_BASE_URL}/get-event-capsule-presigned-url`,
            { fileName, fileType: file.type, folderName },
            { headers: { Authorization: `${token}` } }
        );
        if (!data.uploadURL || !data.key) throw new Error("Presigned URL not received");

        await axios.put(data.uploadURL, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (e) => {
                if (e.total) setVideoPercent(Math.round((e.loaded / e.total) * 100));
            },
        });
        setVideoPercent(100);
    };

    const uploadVideo = async (file) => {
        const contentType = file.type || "video/mp4";
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const fileName = `${activeFolder}_${uid()}${getExt(file.name) || ".mp4"}`;
        setVideoPercent(0);

        const initRes = await fetch(`${MEDIA_PROCESSING_BASE_URL}/initiate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName, fileType: contentType, totalChunks, folderName }),
        });
        if (!initRes.ok) throw new Error("Failed to initiate upload");
        const { uploadId, key, presignedUrls } = await initRes.json();

        const chunks = Array.from({ length: totalChunks }, (_, i) => ({
            partNumber: i + 1,
            blob: file.slice(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, file.size)),
            url: presignedUrls[i],
        }));

        const parts = [];
        let done = 0;
        let next = 0;

        const worker = async () => {
            while (next < chunks.length) {
                const chunk = chunks[next++];
                const eTag = await putWithRetry(chunk, contentType);
                parts.push({ PartNumber: chunk.partNumber, ETag: eTag ? eTag.replace(/"/g, "") : "" });
                done += chunk.blob.size;
                setVideoPercent(Math.min(Math.round((done / file.size) * 100), 99));
            }
        };
        await Promise.all(
            Array.from({ length: Math.min(CHUNK_CONCURRENCY, chunks.length) }, worker)
        );

        parts.sort((a, b) => a.PartNumber - b.PartNumber);
        const completeRes = await fetch(`${MEDIA_PROCESSING_BASE_URL}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uploadId, key, parts }),
        });
        if (!completeRes.ok) throw new Error("Failed to complete upload");
        setVideoPercent(100);
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (!files.length || !activeFolder) return;

        setUploading(true);
        setUploadInfo({ total: files.length, completed: 0, failed: 0 });

        for (const file of files) {
            const previewUrl = URL.createObjectURL(file);
            const isVideo = file.type.startsWith("video/");
            const itemKey = uid();

            setCurrentFile({ url: previewUrl, isVideo, name: file.name });
            setPendingItems((prev) => [
                { key: itemKey, folderId: activeFolder, url: previewUrl, isVideo, status: "uploading" },
                ...prev,
            ]);
            setVideoPercent(0);

            try {
                if (isVideo) await uploadVideo(file);
                else await uploadImage(file);
                updatePending(itemKey, "uploaded");
                setUploadInfo((p) => ({ ...p, completed: p.completed + 1 }));
            } catch (err) {
                console.error("Upload failed:", file.name, err);
                updatePending(itemKey, "failed");
                setUploadInfo((p) => ({ ...p, completed: p.completed + 1, failed: p.failed + 1 }));
            }
        }

        setVideoPercent(0);
        setCurrentFile(null);
        setUploading(false);
        setTimeout(() => setUploadInfo({ total: 0, completed: 0, failed: 0 }), 3000);
    };


    const handleUploadDone = async () => {
        if (!activeFolder) return;

        try {
            setSaving(true);

            await axios.post(
                `${MEDIA_PROCESSING_BASE_URL}/supplier-upload-done`,
                {
                    folderName,
                    userId: id,
                    subFolderId: activeFolder,
                },
                {
                    headers: {
                        Authorization: `${getAuthToken()}`
                    }
                }
            );

            showToast("Upload done, processing started...");
            await fetchThumbnails();
            clearPending(activeFolder);
        } catch (err) {
            alert(
                err?.response?.data?.message ||
                err.message ||
                "Done API failed"
            );
        } finally {
            setSaving(false);
        }
    };

    const currentImage = previewIndex !== null ? filteredPhotos[previewIndex] : null;

    const deleteImage = async () => {
        if (!currentImage?._id) return;
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            const res = await fetch(`${MEDIA_PROCESSING_BASE_URL}/delete-image/${currentImage._id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(await res.text());
            setPhotos((prev) => prev.filter((p) => p._id !== currentImage._id));
            setPreviewIndex(null);
            showToast("Deleted");
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="ed-loader-wrap">
                <div className="ed-loader" />
            </div>
        );
    }

    return (
        <div className="ed-page">
            <div className="ed-topbar">
                <button className="ed-back" onClick={() => router.back()}>← Back</button>
                <h2>Edit Vendor Details</h2>
            </div>

            {/* Personal details */}
            <section className="ed-card">
                <div className="ed-card-head">
                    <h3>Personal Details</h3>
                    <button className="ed-btn-outline" onClick={() => setModal("details")}>Edit</button>
                </div>
                <div className="ed-profile">
                    <div className="avatar">
                        {(user?.avatar && user.avatar !="attachment-1678985070996.jpg") ? (
                            <img src={`${user.avatar}`} alt="avatar" />
                        ) : (
                            <span>{(user?.name || "?")[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div className="ed-info">
                        <div><b>Name:</b> {user?.name || "N/A"}</div>
                        <div><b>Phone:</b> {user?.phone || phone || "N/A"}</div>
                        <div><b>Age:</b> {user?.age || "N/A"}</div>
                        <div><b>Experience:</b> {user?.experience || "N/A"}</div>
                        <div><b>City:</b> {user?.city || "N/A"}</div>
                    </div>
                </div>
            </section>

            {/* About */}
            <section className="ed-card">
                <div className="ed-card-head">
                    <h3>About</h3>
                    <button className="ed-btn-outline" onClick={() => setModal("about")}>Edit</button>
                </div>
                <p className="ed-text">{user?.about || "No about added yet."}</p>
            </section>

            {/* Specialization */}
            <section className="ed-card">
                <div className="ed-card-head">
                    <h3>Specialization</h3>
                    <button className="ed-btn-outline" onClick={() => setModal("spec")}>Edit</button>
                </div>
                {selectedSpecList.length > 0 ? (
                    <div className="ed-spec-row">
                        {selectedSpecList.map((s) => (
                            <div key={s._id} className="ed-spec-chip">
                                <img src={`${BASE_URL}/api/uploads/specialization/${s.image}`} alt={s.name} />
                                <span>{s.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="ed-text">Not selected yet</p>
                )}
            </section>

            {/* Recent work */}
            <section className="ed-card">
                <div className="ed-card-head">
                    <h3>Recent Work</h3>
                    <div className="ed-actions">
                        <button
                            className="ed-btn-outline"
                            onClick={() => setModal("folder")}
                        >
                            + New Folder
                        </button>
                    </div>
                </div>

                {subFolders.length === 0 ? (
                    <p className="ed-text">No folders yet. Create a new folder to start uploading.</p>
                ) : (
                    <>
                        <div className="ed-tabs">
                            {subFolders.map((f) => {
                                const folderImage = folderCovers[f._id] || "";

                                return (
                                    <button
                                        key={f._id}
                                        className={`ed-tab ${activeFolder === f._id ? "active" : ""}`}
                                        onClick={() => selectFolder(f._id)}
                                    >
                                        <div className="ed-tab-image">
                                            {folderImage ? (
                                                <img src={folderImage} alt={f.folderName || "Album"} />
                                            ) : (
                                                <div className="ed-tab-placeholder">
                                                    {f.folderName?.charAt(0)?.toUpperCase() || "A"}
                                                </div>
                                            )}
                                        </div>

                                        <span className="ed-tab-name">
                                            {f.folderName || "Album"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {activeFolder && (
                            <div className="ed-done-wrap">
                                <button
                                    className="ed-btn"
                                    onClick={handleUploadDone}
                                    disabled={saving || uploading}
                                >
                                    {saving ? "Processing..." : "Done"}
                                </button>

                                <button
                                    className="ed-btn-outline"
                                    disabled={!activeFolder || uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {uploading ? "Uploading..." : "+ Add Photos"}
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    style={{ display: "none" }}
                                    onChange={handleFileSelect}
                                />
                            </div>
                        )}

                        {filteredPhotos.length > 0 || pendingForActive.length > 0 ? (
                            <div className="ed-grid">
                                {pendingForActive.map((item) => (
                                    <div key={item.key} className="ed-thumb ed-thumb-pending">
                                        {item.isVideo ? (
                                            <video src={item.url} muted />
                                        ) : (
                                            <img src={item.url} alt="" />
                                        )}
                                        {item.status === "uploading" && <span className="ed-mini-loader" />}
                                        {item.status === "failed" && <span className="ed-mini-fail">!</span>}
                                    </div>
                                ))}
                                {visiblePhotos.map((p, i) => (
                                    <div key={p._id || p.fileId} className="ed-thumb" onClick={() => setPreviewIndex(i)}>
                                        {p.type === "video" ? (
                                            <>
                                                <GridVideo src={p.videoClipUrl || p.originalUrl} />
                                                <span className="ed-video-badge">▶</span>
                                            </>
                                        ) : (
                                            <img src={p.thumbnailImageUrl || p.originalUrl} alt="" loading="lazy" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="ed-text ed-empty">No photos uploaded yet.</p>
                        )}

                        {filteredPhotos.length > visibleCount && (
                            <div className="ed-done-wrap">
                                <button
                                    className="ed-btn-outline"
                                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                                >
                                    Load more ({filteredPhotos.length - visibleCount} left)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ---------- Modals ---------- */}
            <Modal open={modal === "details"} title="Edit Details" onClose={() => setModal(null)}>
                <form className="ed-form" onSubmit={saveDetails}>
                    <div className="ed-avatar-edit">
                        <div className="ed-avatar">
                            {form.avatar || user?.avatar ? (
                                <img src={form.avatar || user.avatar} alt="avatar" />
                            ) : (
                                <span>{(form.name || "?")[0]}</span>
                            )}
                        </div>
                        <label className="ed-btn-outline ed-file-label">
                            Change Photo
                            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                        </label>
                    </div>

                    <label>Name
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </label>
                    <label>Age (years)
                        <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                    </label>
                    <label>Experience (years)
                        <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                    </label>
                    <label>Location
                        <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                            <option value="">Select Location</option>
                            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>
                    <button type="submit" className="ed-btn ed-btn-full" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                </form>
            </Modal>

            <Modal open={modal === "about"} title="Edit About" onClose={() => setModal(null)}>
                <form className="ed-form" onSubmit={saveAbout}>
                    <textarea
                        rows={6}
                        maxLength={300}
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        placeholder="Write about the photographer..."
                    />
                    <div className="ed-count">{aboutText.length}/300</div>
                    <button type="submit" className="ed-btn ed-btn-full" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                </form>
            </Modal>

            <Modal open={modal === "spec"} title="Edit Specialization" onClose={() => setModal(null)}>
                <div className="ed-spec-list">
                    {allSpecs.map((s) => {
                        const on = selectedSpecs.includes(s._id);
                        return (
                            <div
                                key={s._id}
                                className={`ed-spec-item ${on ? "active" : ""}`}
                                onClick={() => toggleSpec(s._id)}
                            >
                                <img src={`${BASE_URL}/api/uploads/specialization/${s.image}`} alt={s.name} />
                                <span>{s.name}</span>
                                <i className={`ed-check ${on ? "on" : ""}`}>{on ? "✓" : ""}</i>
                            </div>
                        );
                    })}
                </div>
                <button className="ed-btn ed-btn-full" onClick={saveSpecs} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </button>
            </Modal>

            <Modal open={modal === "folder"} title="Create New Folder" onClose={() => setModal(null)}>
                <form className="ed-form" onSubmit={createSubFolder}>
                    <input
                        placeholder="Type folder name"
                        maxLength={50}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <button type="submit" className="ed-btn ed-btn-full" disabled={saving || !newFolderName.trim()}>
                        {saving ? "Creating..." : "Create"}
                    </button>
                </form>
            </Modal>

            {/* Preview */}
            <Modal open={previewIndex !== null} title="Preview" onClose={() => setPreviewIndex(null)} wide>
                {currentImage && (
                    <>
                        <div className="ed-preview">
                            {currentImage.type === "video" ? (
                                <video src={currentImage.originalUrl || currentImage.videoClipUrl} controls autoPlay />
                            ) : (
                                <img src={currentImage.originalUrl || currentImage.thumbnailImageUrl} alt="" />
                            )}
                        </div>
                        <div className="ed-preview-actions">
                            <button
                                className="ed-btn-outline"
                                disabled={previewIndex === 0}
                                onClick={() => setPreviewIndex((i) => i - 1)}
                            >
                                ← Prev
                            </button>
                            <button className="ed-btn-danger" onClick={deleteImage}>Delete</button>
                            <button
                                className="ed-btn-outline"
                                disabled={previewIndex >= filteredPhotos.length - 1}
                                onClick={() => setPreviewIndex((i) => i + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {uploadInfo.total > 0 && (
                <div className="ed-upload-popup">
                    <div className="ed-upload-title">
                        {uploadInfo.completed >= uploadInfo.total
                            ? "Upload complete ✓"
                            : `Uploading ${Math.min(uploadInfo.completed + 1, uploadInfo.total)}/${uploadInfo.total}`}
                    </div>

                    <div className="ed-upload-bar">
                        <div
                            style={{
                                width: `${Math.min(
                                    ((uploadInfo.completed + (currentFile ? videoPercent / 100 : 0)) /
                                        uploadInfo.total) * 100,
                                    100
                                )}%`,
                            }}
                        />
                    </div>

                    {currentFile && <div className="ed-upload-pct">{videoPercent}%</div>}
                    {uploadInfo.failed > 0 && (
                        <div className="ed-upload-fail">{uploadInfo.failed} failed</div>
                    )}
                </div>
            )}

            {toast && <div className="ed-toast">{toast}</div>}
        </div>
    );
};

export default EditVendorDetails;