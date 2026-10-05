"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { BASE_URL, GET_GALLERY_DATA } from "@/utils/apiconstant";
import { useRouter } from "next/navigation";

const CapsuleUpload = () => {
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [eventCapsuleFiles, setEventCapsuleFiles] = useState([]);
    const [loadingS3Files, setLoadingS3Files] = useState(false);
    const [deletingFile, setDeletingFile] = useState(null);
    const [galleryDetails, setGalleryDetails] = useState(null);
    const [isSubmittingDone, setIsSubmittingDone] = useState(false);

    // =========================
    // PAGINATION
    // =========================
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 50;

    const searchParams = useSearchParams();
    const router = useRouter();

    const toId =
        typeof window !== "undefined"
            ? localStorage.getItem("supplierID")
            : null;

    const orderId = searchParams.get("orderId");

    // =========================
    // PAGINATION CALCULATION
    // =========================
    const totalPages = Math.ceil(
        eventCapsuleFiles.length / ITEMS_PER_PAGE
    );

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const currentPageFiles = eventCapsuleFiles.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // =========================
    // GET GALLERY DETAILS
    // =========================
    const fetchGalleryDetails = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}${GET_GALLERY_DATA}/${orderId}?toId=${toId}`
            );

            const responseData = await response.json();

            console.log("responseData", responseData);

            if (responseData?.success === false) {
                router.push(`/supplier/login?orderId=${orderId}`);
                return;
            }

            if (response.ok) {
                console.log("Folder Details:", responseData);

                setGalleryDetails(responseData?.data);
            } else {
                console.log(
                    "Failed to fetch folder details:",
                    responseData
                );

                setGalleryDetails(null);
            }
        } catch (error) {
            console.log("fetchFolderDetails error", error);

            setGalleryDetails(null);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchGalleryDetails();
        }
    }, [orderId]);

    // =========================
    // GET S3 FOLDER FILES
    // =========================
    const getS3FolderFiles = async () => {
        if (!galleryDetails?.folderName) {
            setEventCapsuleFiles([]);
            setCurrentPage(1);
            return;
        }

        try {
            setLoadingS3Files(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:4000/get-s3-folder-images`,
                {
                    params: {
                        folderName: galleryDetails.folderName,
                    },
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            const files = response?.data?.data || [];

            const formattedFiles = files.map((item) => ({
                fileName: item.fileName,

                fileType: item.fileName?.match(
                    /\.(mp4|mov|avi|webm|mkv)$/i
                )
                    ? `video/${item.fileName.split(".").pop()}`
                    : `image/${item.fileName.split(".").pop()}`,

                preview: item.url,
                originalUrl: item.url,
                key: item.key,

                progress: 100,
                status: "uploaded",

                isExisting: true,
            }));

            setEventCapsuleFiles(formattedFiles);

            // Start from first page
            setCurrentPage(1);
        } catch (error) {
            console.error(
                "Failed to get S3 folder files:",
                error
            );
        } finally {
            setLoadingS3Files(false);
        }
    };

    // =========================
    // GET EXISTING FILES
    // =========================
    useEffect(() => {
        getS3FolderFiles();
    }, [galleryDetails?.folderName]);

    // =========================
    // UPLOAD FILE
    // =========================
    const uploadEventCapsuleFile = async (file, index) => {
        try {
            const token = localStorage.getItem("token");

            // Original extension
            const fileExtension = file.name.substring(
                file.name.lastIndexOf(".")
            );

            // Unique ID
            const uniqueId = crypto.randomUUID
                ? crypto.randomUUID()
                : Array.from(
                    crypto.getRandomValues(new Uint8Array(16))
                )
                    .map((b) =>
                        b.toString(16).padStart(2, "0")
                    )
                    .join("");

            // Unique file name
            const uniqueFileName = `${uniqueId}${fileExtension}`;

            // Get presigned URL
            const response = await axios.post(
                `http://localhost:4000/get-event-capsule-presigned-url`,
                {
                    fileName: uniqueFileName,
                    fileType: file.type,
                    folderName: galleryDetails?.folderName,
                },
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            const { uploadURL, key } = response.data;

            if (!uploadURL || !key) {
                throw new Error(
                    "Presigned URL not received"
                );
            }

            // Set uploading
            setEventCapsuleFiles((prev) =>
                prev.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            status: "uploading",
                            progress: 0,
                        }
                        : item
                )
            );

            // Direct S3 upload
            let lastProgress = 0;

            await axios.put(uploadURL, file, {
                headers: {
                    "Content-Type": file.type,
                },

                onUploadProgress: (progressEvent) => {
                    if (!progressEvent.total) return;

                    const percent = Math.round(
                        (progressEvent.loaded * 100) /
                        progressEvent.total
                    );

                    // Sirf har 5% par state update
                    if (percent - lastProgress < 5 && percent !== 100) {
                        return;
                    }

                    lastProgress = percent;

                    setEventCapsuleFiles((prev) =>
                        prev.map((item, i) =>
                            i === index
                                ? {
                                    ...item,
                                    progress: percent,
                                }
                                : item
                        )
                    );
                },
            });

            const originalUrl =
                `https://photography-hora.s3.eu-north-1.amazonaws.com/${key}`;

            // Upload successful
            setEventCapsuleFiles((prev) =>
                prev.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            status: "uploaded",
                            progress: 100,
                            key,
                            originalUrl,
                            preview: originalUrl,
                            isExisting: true,
                        }
                        : item
                )
            );

            return {
                success: true,
                key,
                originalUrl,
            };
        } catch (error) {
            console.error(
                `Upload failed for ${file.name}:`,
                error
            );

            setEventCapsuleFiles((prev) =>
                prev.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            status: "failed",
                            progress: 0,
                            error:
                                error?.response?.data?.message ||
                                error?.message ||
                                "Upload failed",
                        }
                        : item
                )
            );

            return {
                success: false,
                error:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Upload failed",
            };
        }
    };

    // =========================
    // SELECT + UPLOAD FILES
    // =========================
    const handleEventCapsuleUpload = async (e) => {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        if (!galleryDetails?.folderName) {
            alert("Event Capsule folder not found.");
            return;
        }

        const selectedFiles = files.map((file) => ({
            file,
            fileName: file.name,
            fileType: file.type,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "pending",
            isExisting: false,
        }));

        // Keep existing files + add new files
        setEventCapsuleFiles((prev) => [
            ...selectedFiles,
            ...prev,
        ]);

        // New files visible from first page
        setCurrentPage(1);

        setUploadingFiles(true);

        try {
            const CONCURRENCY = 15;

            let nextIndex = 0;

            const uploadNext = async () => {
                const index = nextIndex++;

                if (index >= selectedFiles.length) return;

                await uploadEventCapsuleFile(
                    selectedFiles[index].file,
                    index
                );

                // Jaise hi ek complete hua, next file start
                await uploadNext();
            };

            await Promise.all(
                Array.from(
                    { length: Math.min(CONCURRENCY, selectedFiles.length) },
                    () => uploadNext()
                )
            );
        } catch (error) {
            console.error(
                "Event Capsule upload error:",
                error
            );
        } finally {
            setUploadingFiles(false);
            e.target.value = "";
        }
    };

    // =========================
    // DELETE S3 FILE
    // =========================
    const handleDeleteS3File = async (item, actualIndex) => {
        if (!item?.key) {
            console.error("S3 key not found");
            return;
        }

        try {
            setDeletingFile(actualIndex);

            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:4000/delete-s3-image`,
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                    data: {
                        key: item.key,
                    },
                }
            );

            // Remove from UI
            setEventCapsuleFiles((prev) =>
                prev.filter(
                    (_, i) => i !== actualIndex
                )
            );

            // Calculate remaining pages
            const remainingFiles =
                eventCapsuleFiles.length - 1;

            const remainingPages = Math.max(
                1,
                Math.ceil(
                    remainingFiles / ITEMS_PER_PAGE
                )
            );

            // If current page becomes invalid,
            // move to previous page
            if (currentPage > remainingPages) {
                setCurrentPage(remainingPages);
            }
        } catch (error) {
            console.error(
                "S3 delete failed:",
                error
            );

            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete image"
            );
        } finally {
            setDeletingFile(null);
        }
    };

    // =========================
    // RETRY UPLOAD
    // =========================
    const handleRetryUpload = async (
        item,
        actualIndex
    ) => {
        if (!item?.file) {
            console.error(
                "Original file not found for retry"
            );

            return;
        }

        setUploadingFiles(true);

        try {
            await uploadEventCapsuleFile(
                item.file,
                actualIndex
            );
        } finally {
            setUploadingFiles(false);
        }
    };

    // =========================
    // SUPPLIER UPLOAD DONE API
    // =========================
    const handleUploadDone = async () => {
        const folderId = galleryDetails?.folderId;
        const folderName = galleryDetails?.folderName;

        if (!folderId || !folderName || !orderId) {
            alert(
                "Folder Details or Order ID missing."
            );

            return;
        }

        try {
            setIsSubmittingDone(true);

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `http://localhost:4000/supplier-upload-done`,
                {
                    folderId,
                    folderName,
                    orderId,
                },
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            if (response.data?.success) {
                alert(
                    "Upload marked as complete! Background processing started."
                );
            } else {
                alert(
                    response.data?.message ||
                    "Failed to mark as done"
                );
            }
        } catch (error) {
            console.error(
                "Error marking upload as done:",
                error
            );

            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong while marking as done"
            );
        } finally {
            setIsSubmittingDone(false);
        }
    };

    // =========================
    // PAGE CHANGE
    // =========================
    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        setCurrentPage(page);

        // Scroll to top of image section
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="actual-image-container">
            {!galleryDetails?.folderName ? (
                <div
                    style={{
                        color: "#dc3545",
                        fontSize: "13px",
                        marginTop: "8px",
                    }}
                >
                    ✗ Event Capsule folder not found
                </div>
            ) : (
                <>
                    {/* =========================
                        ACTION BUTTONS
                    ========================= */}
                    <div
                        style={{
                            marginTop: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flexWrap: "wrap",
                        }}
                    >
                        <input
                            type="file"
                            id="eventCapsuleUpload"
                            multiple
                            accept="image/*,video/*"
                            onChange={
                                handleEventCapsuleUpload
                            }
                            disabled={
                                uploadingFiles ||
                                isSubmittingDone
                            }
                            style={{
                                display: "none",
                            }}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById(
                                        "eventCapsuleUpload"
                                    )
                                    ?.click()
                            }
                            disabled={
                                uploadingFiles ||
                                isSubmittingDone
                            }
                            style={{
                                padding: "10px 18px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor:
                                    "#007BFF",
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor:
                                    uploadingFiles ||
                                        isSubmittingDone
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    uploadingFiles ||
                                        isSubmittingDone
                                        ? 0.7
                                        : 1,
                            }}
                        >
                            {uploadingFiles
                                ? "Uploading..."
                                : "Upload Images / Videos"}
                        </button>

                        {/* COMPLETE UPLOAD */}
                        <button
                            type="button"
                            onClick={
                                handleUploadDone
                            }
                            disabled={
                                uploadingFiles ||
                                isSubmittingDone
                            }
                            style={{
                                padding: "10px 18px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor:
                                    "#28a745",
                                color: "#fff",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor:
                                    uploadingFiles ||
                                        isSubmittingDone
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    uploadingFiles ||
                                        isSubmittingDone
                                        ? 0.7
                                        : 1,
                            }}
                        >
                            {isSubmittingDone
                                ? "Processing..."
                                : "Complete & Submit Upload"}
                        </button>
                    </div>

                    {/* =========================
                        LOADING S3
                    ========================= */}
                    {loadingS3Files && (
                        <div
                            style={{
                                marginTop: "15px",
                                fontSize: "13px",
                                color: "#64748b",
                            }}
                        >
                            Loading existing files...
                        </div>
                    )}

                    {/* =========================
                        FILE COUNT
                    ========================= */}
                    {!loadingS3Files &&
                        eventCapsuleFiles.length > 0 && (
                            <div
                                style={{
                                    marginTop: "15px",
                                    fontSize: "13px",
                                    color: "#64748b",
                                }}
                            >
                                Showing{" "}
                                {startIndex + 1}-
                                {Math.min(
                                    startIndex +
                                    ITEMS_PER_PAGE,
                                    eventCapsuleFiles.length
                                )}{" "}
                                of{" "}
                                {eventCapsuleFiles.length}{" "}
                                files
                            </div>
                        )}

                    {/* =========================
                        FILES DISPLAY GRID
                    ========================= */}
                    {eventCapsuleFiles?.length > 0 && (
                        <>
                            <div
                                style={{
                                    marginTop: "20px",
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(110px, 1fr))",
                                    gap: "12px",
                                }}
                            >
                                {currentPageFiles.map(
                                    (item, index) => {
                                        // VERY IMPORTANT:
                                        // Actual index in complete array
                                        const actualIndex =
                                            startIndex +
                                            index;

                                        return (
                                            <div
                                                key={`${item.key ||
                                                    item.fileName
                                                    }-${actualIndex}`}
                                                style={{
                                                    position:
                                                        "relative",
                                                    width: "100%",
                                                    aspectRatio:
                                                        "1 / 1",
                                                    borderRadius:
                                                        "8px",
                                                    border:
                                                        "1px solid #cbd5e1",
                                                    backgroundColor:
                                                        "#f1f5f9",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >
                                                {/* IMAGE / VIDEO */}
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        overflow:
                                                            "hidden",
                                                        borderRadius:
                                                            "8px",
                                                    }}
                                                >
                                                    {item.fileType?.startsWith(
                                                        "video/"
                                                    ) ? (
                                                        <video
                                                            src={
                                                                item.preview
                                                            }
                                                            muted
                                                            playsInline
                                                            preload="metadata"
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={
                                                                item.preview
                                                            }
                                                            alt={
                                                                item.fileName
                                                            }
                                                            loading="lazy"
                                                            decoding="async"
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {/* =========================
                                                    DELETE CROSS
                                                ========================= */}
                                                {item.status ===
                                                    "uploaded" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteS3File(
                                                                    item,
                                                                    actualIndex
                                                                )
                                                            }
                                                            disabled={
                                                                deletingFile ===
                                                                actualIndex ||
                                                                isSubmittingDone
                                                            }
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                top: "5px",
                                                                right: "5px",
                                                                width: "24px",
                                                                height: "24px",
                                                                borderRadius:
                                                                    "50%",
                                                                border: "none",
                                                                backgroundColor:
                                                                    "rgba(0,0,0,0.65)",
                                                                color: "#fff",
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                cursor:
                                                                    deletingFile ===
                                                                        actualIndex
                                                                        ? "not-allowed"
                                                                        : "pointer",
                                                                fontSize:
                                                                    "16px",
                                                                lineHeight:
                                                                    "1",
                                                                zIndex: 10,
                                                                padding: 0,
                                                            }}
                                                        >
                                                            {deletingFile ===
                                                                actualIndex
                                                                ? "..."
                                                                : "×"}
                                                        </button>
                                                    )}

                                                {/* =========================
                                                    STATUS BAR
                                                ========================= */}
                                                <div
                                                    style={{
                                                        position:
                                                            "absolute",
                                                        bottom: "6px",
                                                        left: "6px",
                                                        right: "6px",
                                                        zIndex: 5,
                                                        padding:
                                                            "4px 5px",
                                                        borderRadius:
                                                            "5px",
                                                        fontSize:
                                                            "9px",
                                                        fontWeight:
                                                            "600",
                                                        color: "#fff",
                                                        backgroundColor:
                                                            item.status ===
                                                                "uploaded"
                                                                ? "#28a745"
                                                                : item.status ===
                                                                    "failed"
                                                                    ? "#dc3545"
                                                                    : item.status ===
                                                                        "uploading"
                                                                        ? "#007BFF"
                                                                        : "#64748b",
                                                        textAlign:
                                                            "center",
                                                        whiteSpace:
                                                            "nowrap",
                                                        overflow:
                                                            "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        boxSizing:
                                                            "border-box",
                                                    }}
                                                >
                                                    {item.status ===
                                                        "pending" &&
                                                        `${item.fileType?.startsWith(
                                                            "video/"
                                                        )
                                                            ? "Video"
                                                            : "Image"
                                                        } - Pending`}

                                                    {item.status ===
                                                        "uploading" &&
                                                        `${item.fileType?.startsWith(
                                                            "video/"
                                                        )
                                                            ? "Video"
                                                            : ""
                                                        }   ${item.progress ||
                                                        0}%`}

                                                    {item.status ===
                                                        "uploaded" &&
                                                        `${item.fileType?.startsWith(
                                                            "video/"
                                                        )
                                                            ? "Video"
                                                            : "Image"
                                                        } - Uploaded`}

                                                    {item.status ===
                                                        "failed" &&
                                                        `${item.fileType?.startsWith(
                                                            "video/"
                                                        )
                                                            ? "Video"
                                                            : "Image"
                                                        } - Failed`}
                                                </div>

                                                {/* =========================
                                                    PROGRESS BAR
                                                ========================= */}
                                                {item.status ===
                                                    "uploading" && (
                                                        <div
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                bottom: "38px",
                                                                left: "7px",
                                                                right: "7px",
                                                                height: "4px",
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.6)",
                                                                borderRadius:
                                                                    "5px",
                                                                overflow:
                                                                    "hidden",
                                                                zIndex: 5,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: `${item.progress ||
                                                                        0}%`,
                                                                    height:
                                                                        "100%",
                                                                    backgroundColor:
                                                                        "#007BFF",
                                                                    transition:
                                                                        "width 0.2s ease",
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                {/* =========================
                                                    RETRY BUTTON
                                                ========================= */}
                                                {item.status ===
                                                    "failed" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRetryUpload(
                                                                    item,
                                                                    actualIndex
                                                                )
                                                            }
                                                            disabled={
                                                                uploadingFiles ||
                                                                isSubmittingDone
                                                            }
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                bottom: "35px",
                                                                left: "7px",
                                                                right: "7px",
                                                                padding:
                                                                    "5px",
                                                                backgroundColor:
                                                                    "rgba(220,53,69,0.9)",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius:
                                                                    "4px",
                                                                fontSize:
                                                                    "10px",
                                                                fontWeight:
                                                                    "600",
                                                                textAlign:
                                                                    "center",
                                                                cursor:
                                                                    uploadingFiles ||
                                                                        isSubmittingDone
                                                                        ? "not-allowed"
                                                                        : "pointer",
                                                                zIndex: 5,
                                                            }}
                                                        >
                                                            Retry Upload
                                                        </button>
                                                    )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            {/* =========================
                                PAGINATION
                            ========================= */}
                            {totalPages > 1 && (
                                <div
                                    style={{
                                        marginTop: "25px",
                                        marginBottom: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:
                                            "center",
                                        gap: "6px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {/* PREVIOUS */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(
                                                currentPage -
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        style={{
                                            padding:
                                                "7px 12px",
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "5px",
                                            background:
                                                "#fff",
                                            color: "#333",
                                            cursor:
                                                currentPage ===
                                                    1
                                                    ? "not-allowed"
                                                    : "pointer",
                                            opacity:
                                                currentPage ===
                                                    1
                                                    ? 0.5
                                                    : 1,
                                        }}
                                    >
                                        Previous
                                    </button>

                                    {/* PAGE NUMBERS */}
                                    {Array.from(
                                        {
                                            length: totalPages,
                                        },
                                        (_, index) =>
                                            index + 1
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() =>
                                                handlePageChange(
                                                    page
                                                )
                                            }
                                            style={{
                                                minWidth:
                                                    "35px",
                                                padding:
                                                    "7px 10px",
                                                border:
                                                    "1px solid #ddd",
                                                borderRadius:
                                                    "5px",
                                                background:
                                                    currentPage ===
                                                        page
                                                        ? "#007BFF"
                                                        : "#fff",
                                                color:
                                                    currentPage ===
                                                        page
                                                        ? "#fff"
                                                        : "#333",
                                                cursor:
                                                    "pointer",
                                                fontWeight:
                                                    currentPage ===
                                                        page
                                                        ? "600"
                                                        : "400",
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {/* NEXT */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(
                                                currentPage +
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        style={{
                                            padding:
                                                "7px 12px",
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "5px",
                                            background:
                                                "#fff",
                                            color: "#333",
                                            cursor:
                                                currentPage ===
                                                    totalPages
                                                    ? "not-allowed"
                                                    : "pointer",
                                            opacity:
                                                currentPage ===
                                                    totalPages
                                                    ? 0.5
                                                    : 1,
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default CapsuleUpload;