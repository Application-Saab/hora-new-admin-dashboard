export const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return null;

    return date.toISOString();
};