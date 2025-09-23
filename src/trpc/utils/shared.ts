export const generateSessionTitle = (firstMessage: string): string => {
    if (firstMessage.length <= 30) return firstMessage;

    // Extract key topics
    const lower = firstMessage.toLowerCase();
    if (lower.includes("resume")) return " Resume Help";
    if (lower.includes("interview")) return "Interview Prep";
    if (lower.includes("career change")) return "Career Transition";
    if (lower.includes("salary")) return "Salary Discussion";
    if (lower.includes("skill")) return "Skill Development";
    if (lower.includes("network")) return "Networking Strategy";

    return firstMessage.substring(0, 30) + "...";
  };