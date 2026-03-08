export function analyzeAction(input: string) {
  const text = input.toLowerCase()

  if (text.includes("push") && text.includes("main")) {
    return {
      action: "GitHub Push",
      risk: "HIGH",
      reason: [
        "Direct push to main branch",
        "Could bypass code review workflow",
        "May affect production stability"
      ],
      recommendation: "Create a pull request instead"
    }
  }

  if (text.includes("test") || text.includes("pytest")) {
    return {
      action: "Run Tests",
      risk: "LOW",
      reason: [
        "Running tests is a safe development operation"
      ],
      recommendation: "Safe to execute"
    }
  }

  if (text.includes("delete")) {
    return {
      action: "Delete File",
      risk: "CRITICAL",
      reason: [
        "File deletion may remove important resources",
        "Potential system instability"
      ],
      recommendation: "Verify file importance before deletion"
    }
  }

  return {
    action: "Unknown Action",
    risk: "MEDIUM",
    reason: [
      "SentinelAI could not fully classify the request"
    ],
    recommendation: "Manual review recommended"
  }
}