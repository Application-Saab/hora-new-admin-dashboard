"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import {
  fetchVenueSuggestion,
  updateVenueFaqs,
  fetchVenuePackages,
} from "@/services/venueListServices";
import VenueFaqPromptModal from "../../component/VenueFaqPromptModal";

const VenueFaqPopup = ({ isOpen, onClose, venue, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestedFaqs, setSuggestedFaqs] = useState([]);
  const [faqsList, setFaqsList] = useState([]);
  const [suggestionSearch, setSuggestionSearch] = useState("");

  // Packages state for prompt context
  const [venuePackages, setVenuePackages] = useState([]);

  // Prompt modal state
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Hidden file input ref
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && venue?._id) {
      if (venue?.faqs && Array.isArray(venue.faqs)) {
        setFaqsList(
          venue.faqs.map((f) => ({
            question: f.question || "",
            answer: f.answer || "",
          })),
        );
      } else {
        setFaqsList([]);
      }

      setLoadingSuggestions(true);
      fetchVenueSuggestion("FAQ")
        .then((data) => setSuggestedFaqs(data || []))
        .finally(() => setLoadingSuggestions(false));

      // Fetch packages to provide full context in prompt
      fetchVenuePackages(
        venue._id,
        (data) => setVenuePackages(data || []),
        () => {},
      );
    }
  }, [isOpen, venue]);

  const isQuestionSelected = (questionTitle) => {
    return faqsList.some(
      (item) =>
        item.question.trim().toLowerCase() ===
        questionTitle.trim().toLowerCase(),
    );
  };

  const handleToggleSuggestion = (item) => {
    const qTitle = item.title?.trim();
    if (!qTitle) return;

    if (isQuestionSelected(qTitle)) {
      setFaqsList((prev) =>
        prev.filter(
          (f) => f.question.trim().toLowerCase() !== qTitle.toLowerCase(),
        ),
      );
    } else {
      setFaqsList((prev) => [
        ...prev,
        {
          question: qTitle,
          answer: item.metaData?.defaultAnswer || "",
        },
      ]);
    }
  };

  const handleAddCustomQuestion = () => {
    setFaqsList((prev) => [
      ...prev,
      {
        question: "",
        answer: "",
      },
    ]);
  };

  const handleQuestionChange = (index, val) => {
    setFaqsList((prev) => {
      const copy = [...prev];
      copy[index].question = val;
      return copy;
    });
  };

  const handleAnswerChange = (index, val) => {
    setFaqsList((prev) => {
      const copy = [...prev];
      copy[index].answer = val;
      return copy;
    });
  };

  const handleRemoveFaq = (index) => {
    setFaqsList((prev) => prev.filter((_, i) => i !== index));
  };

  // ========== EXCEL / CSV IMPORT HANDLER ==========
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Read rows as array of arrays (header included)
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawRows || rawRows.length === 0) {
          alert("The uploaded file appears to be empty.");
          return;
        }

        // Determine columns for question & answer dynamically
        const headerRow = rawRows[0] || [];
        let qIdx = -1;
        let aIdx = -1;

        headerRow.forEach((col, idx) => {
          const c = String(col).toLowerCase().trim();
          if (c.includes("question") || c === "q") qIdx = idx;
          if (c.includes("answer") || c === "a") aIdx = idx;
        });

        // Fallback: column 0 = question, column 1 = answer
        if (qIdx === -1) qIdx = 0;
        if (aIdx === -1) aIdx = 1;

        const importedFaqs = [];
        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;

          const question = String(row[qIdx] || "").trim();
          const answer = String(row[aIdx] || "").trim();

          if (question) {
            importedFaqs.push({ question, answer });
          }
        }

        if (importedFaqs.length === 0) {
          alert("Could not find valid Question and Answer rows in the file.");
          return;
        }

        // Append to or replace existing list
        setFaqsList((prev) => {
          const existingQuestions = new Set(
            prev.map((f) => f.question.trim().toLowerCase()),
          );
          const newEntries = importedFaqs.filter(
            (f) => !existingQuestions.has(f.question.toLowerCase()),
          );
          return [...prev, ...newEntries];
        });

        alert(`Successfully imported ${importedFaqs.length} FAQs! You can now review and edit them.`);
      } catch (err) {
        console.error("Failed to parse file:", err);
        alert("Failed to parse file. Please upload a valid .xlsx or .csv file.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedFaqs = faqsList.filter((f) => f.question.trim().length > 0);
    if (cleanedFaqs.length === 0 && faqsList.length > 0) {
      alert("Please fill at least the question text or remove empty rows");
      return;
    }

    await updateVenueFaqs(
      venue._id,
      cleanedFaqs,
      onSuccess,
      onClose,
      setLoading,
    );
  };

  const filteredSuggestions = suggestedFaqs.filter((s) =>
    s.title?.toLowerCase().includes(suggestionSearch.toLowerCase().trim()),
  );

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
            bgcolor: "#f9fafb",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Venue FAQs & Answers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Venue: <strong>{venue?.venueName}</strong>
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* BODY */}
        <DialogContent
          dividers
          sx={{
            p: 3,
            overflowY: "auto",
            bgcolor: "#fff",
          }}
          className="slim-scrollbar"
        >
          <form id="venue-faq-form" onSubmit={handleSubmit}>
            {/* 1. SUGGESTED QUESTIONS SECTION */}
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1.5}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <HelpOutlineIcon fontSize="small" color="primary" />
                  <Typography fontWeight={600} fontSize={14}>
                    Suggested FAQs (Click to add or remove)
                  </Typography>
                </Box>

                <Box>
                  {suggestedFaqs.length > 5 && (
                    <TextField
                      size="small"
                      placeholder="Filter suggestions..."
                      value={suggestionSearch}
                      onChange={(e) => setSuggestionSearch(e.target.value)}
                      sx={{
                        width: 180,
                        "& .MuiInputBase-root": {
                          bgcolor: "white",
                          fontSize: 12,
                        },
                      }}
                    />
                  )}
                </Box>
              </Box>

              {loadingSuggestions ? (
                <Box py={2} textAlign="center">
                  <CircularProgress size={22} />
                </Box>
              ) : filteredSuggestions.length === 0 ? (
                <Typography fontSize={13} color="text.secondary">
                  No suggested questions available
                </Typography>
              ) : (
                <Box
                  className="slim-scrollbar"
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    maxHeight: "150px",
                    overflowY: "auto",
                    pr: 0.5,
                  }}
                >
                  {filteredSuggestions.map((item) => {
                    const isSelected = isQuestionSelected(item.title);
                    return (
                      <Chip
                        key={item._id}
                        label={item.title}
                        onClick={() => handleToggleSuggestion(item)}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        icon={
                          isSelected ? (
                            <CheckCircleOutlineIcon style={{ fontSize: 16 }} />
                          ) : (
                            <AddIcon style={{ fontSize: 16 }} />
                          )
                        }
                        sx={{
                          borderRadius: 1.5,
                          fontSize: 12.5,
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* 2. AUTOMATION & ACTIONS BAR */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
              flexWrap="wrap"
              gap={1}
            >
              <Typography fontWeight={700} fontSize={15}>
                Configured Questions ({faqsList.length})
              </Typography>

              <Box display="flex" gap={1} alignItems="center">
                {/* AI Prompt Button */}
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setShowPromptModal(true)}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Generate AI Prompt
                </Button>

                {/* Import Excel / CSV Button */}
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Import Excel/CSV
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                  />
                </Button>

                {/* Add Custom Question Button */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddCustomQuestion}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Add Custom Question
                </Button>
              </Box>
            </Box>

            {/* 3. ACTIVE QUESTIONS & ANSWERS LIST */}
            {faqsList.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  border: "2px dashed #e2e8f0",
                  borderRadius: 2,
                  color: "text.secondary",
                }}
              >
                <Typography fontSize={14}>No FAQs added yet.</Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.5}>
                  Select from suggestions above, import from Excel/CSV, or click &quot;Add Custom Question&quot;
                </Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {faqsList.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      bgcolor: "#fafafa",
                      position: "relative",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1.5}
                    >
                      <Typography fontWeight={600} fontSize={13} color="primary">
                        Q{index + 1}
                      </Typography>
                      <Tooltip title="Delete FAQ">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFaq(index)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <TextField
                      fullWidth
                      size="small"
                      label="Question"
                      placeholder="Enter question here..."
                      value={item.question}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                      sx={{ mb: 1.5, bgcolor: "white" }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      label="Answer"
                      placeholder="Enter answer for this venue..."
                      value={item.answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      sx={{ bgcolor: "white" }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </form>
        </DialogContent>

        {/* FOOTER */}
        <DialogActions
          sx={{
            p: 2.5,
            borderTop: "1px solid #e5e7eb",
            bgcolor: "#f9fafb",
            gap: 1,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="venue-faq-form"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: "none", borderRadius: 2, minWidth: 140 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save FAQs"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI PROMPT MODAL */}
      {showPromptModal && (
        <VenueFaqPromptModal
          isOpen={showPromptModal}
          venue={venue}
          packages={venuePackages}
          onClose={() => setShowPromptModal(false)}
        />
      )}
    </>
  );
};

export default VenueFaqPopup;