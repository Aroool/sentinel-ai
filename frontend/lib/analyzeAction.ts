export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AnalysisResult {
  action: string;
  risk: RiskLevel;
  reason: string[];
  recommendation: string;
  category: string;
}

export function analyzeAction(input: string): AnalysisResult {
  const text = input.toLowerCase().trim();

  // ── CRITICAL ─────────────────────────────────────────────────────────────
  if (/\brm\s+-rf\b/.test(text)) {
    return {
      action: "Recursive Force Delete",
      risk: "CRITICAL",
      category: "File System",
      reason: [
        "Recursively removes files without any confirmation prompt",
        "Cannot be undone — no recycle bin or recovery path",
        "A single wrong path can wipe critical system directories",
      ],
      recommendation:
        "Move files to an archive directory first, or ensure a verified backup exists before proceeding.",
    };
  }

  if (/\bgit\s+push\b.*--force\b|force[\s-]push/i.test(text)) {
    return {
      action: "Force Git Push",
      risk: "CRITICAL",
      category: "Version Control",
      reason: [
        "Rewrites shared remote history for all collaborators",
        "Permanently destroys commits made by other developers",
        "Can corrupt the shared repository and invalidate open PRs",
      ],
      recommendation:
        "Use --force-with-lease and coordinate with the team. Consider a revert commit instead.",
    };
  }

  if (/\bdrop\s+(?:table|database|schema)\b/i.test(text)) {
    return {
      action: "Database Object Destruction",
      risk: "CRITICAL",
      category: "Database",
      reason: [
        "Permanently destroys the database object and all contained data",
        "Data loss is irreversible without a verified backup",
        "Immediately breaks all services that depend on the dropped object",
      ],
      recommendation:
        "Export a full backup first. Use a migration script with a tested rollback path.",
    };
  }

  if (/\btruncate\s+(?:table\s+)?\w/i.test(text)) {
    return {
      action: "Table Truncation",
      risk: "CRITICAL",
      category: "Database",
      reason: [
        "Removes all rows instantly and permanently",
        "Cannot be rolled back in most database engines once committed",
        "May violate foreign key constraints and cascade failures to other tables",
      ],
      recommendation:
        "Export the data first. Prefer soft deletes (is_deleted flag) for production tables.",
    };
  }

  if (
    /(?:echo|print|log|export)\s+.*(?:api[_-]?key|secret|password|token|private[_-]?key)/i.test(
      text
    )
  ) {
    return {
      action: "Credentials Exposure",
      risk: "CRITICAL",
      category: "Security",
      reason: [
        "Prints sensitive credentials to stdout, logs, or the environment",
        "Credentials in output are captured by monitoring and logging tools",
        "Leaked credentials require immediate rotation across all dependent systems",
      ],
      recommendation:
        "Use a secrets manager (Vault, AWS Secrets Manager). Never print credentials. Rotate immediately if exposed.",
    };
  }

  if (/\bkubectl\s+delete\s+(?:namespace|ns|cluster)\b/i.test(text)) {
    return {
      action: "Kubernetes Namespace Deletion",
      risk: "CRITICAL",
      category: "Infrastructure",
      reason: [
        "Deletes all pods, services, and resources in the namespace immediately",
        "Causes instant production outage for all affected services",
        "Full recovery requires a complete redeployment from scratch",
      ],
      recommendation:
        "Scale deployments to 0 replicas first. Document all resources. Obtain explicit team approval.",
    };
  }

  if (/\bdd\s+if=/i.test(text)) {
    return {
      action: "Raw Disk Write",
      risk: "CRITICAL",
      category: "System",
      reason: [
        "Writes directly to a block device — no filesystem protection",
        "Targeting the wrong device can destroy the operating system",
        "Complete and immediate data loss with no recovery path",
      ],
      recommendation:
        "Triple-check the target device path. Create a full backup. Get explicit written approval.",
    };
  }

  if (
    /(?:delete\s+all|purge\s+all|wipe\s+(?:all|everything|database|data))/i.test(
      text
    )
  ) {
    return {
      action: "Bulk Data Destruction",
      risk: "CRITICAL",
      category: "Database",
      reason: [
        "Indiscriminate deletion of all data with no targeted scope",
        "Affects every record — selective recovery is impossible after the fact",
        "May violate data retention compliance requirements",
      ],
      recommendation:
        "Scope the deletion with a WHERE clause. Archive first. Run in a transaction you can roll back.",
    };
  }

  // ── HIGH ─────────────────────────────────────────────────────────────────
  if (
    /\bgit\s+push\b/.test(text) &&
    /\b(?:main|master)\b/.test(text) &&
    !/--force/.test(text)
  ) {
    return {
      action: "Direct Push to Main Branch",
      risk: "HIGH",
      category: "Version Control",
      reason: [
        "Bypasses the pull request and code review workflow",
        "Unreviewed code goes directly to the primary branch",
        "May violate branch protection rules and CODEOWNERS policies",
      ],
      recommendation:
        "Open a pull request from a feature branch and request at least one reviewer.",
    };
  }

  if (/\bgit\s+reset\s+--hard\b/i.test(text)) {
    return {
      action: "Hard Git Reset",
      risk: "HIGH",
      category: "Version Control",
      reason: [
        "Permanently discards all uncommitted changes in the working directory",
        "Cannot be undone for unstaged work — no safety net exists",
        "Staged changes are also lost without stashing first",
      ],
      recommendation:
        "Use git stash to preserve changes, or git reset --soft to keep them staged.",
    };
  }

  if (
    /\bdeploy\b.*\bprod(?:uction)?\b|\brelease\b.*\bprod(?:uction)?\b/i.test(
      text
    ) &&
    !/staging|canary|rollback|dry.run/i.test(text)
  ) {
    return {
      action: "Production Deployment",
      risk: "HIGH",
      category: "Infrastructure",
      reason: [
        "Directly affects live users with immediate effect",
        "Untested changes may introduce regressions at scale",
        "Rollbacks can take significant time during an active outage",
      ],
      recommendation:
        "Deploy to staging first. Verify smoke tests pass. Use canary or blue-green releases.",
    };
  }

  if (/\bnpm\s+publish\b|\bpip\s+upload\b|\bgem\s+push\b/i.test(text)) {
    return {
      action: "Package Publication",
      risk: "HIGH",
      category: "Package Management",
      reason: [
        "Published packages are immediately public and globally accessible",
        "Versions cannot be unpublished once widely downloaded",
        "May accidentally expose internal code, configs, or credentials",
      ],
      recommendation:
        "Run with --dry-run first. Audit .npmignore. Verify semver bump is correct.",
    };
  }

  if (/\bchmod\s+(?:777|a\+rwx|o\+w)\b/i.test(text)) {
    return {
      action: "Insecure File Permissions",
      risk: "HIGH",
      category: "Security",
      reason: [
        "Grants full read, write, and execute access to all system users",
        "Creates a significant privilege escalation attack surface",
        "Violates the principle of least privilege",
      ],
      recommendation:
        "Use minimum required permissions: 644 for files, 755 for executables.",
    };
  }

  if (/\bsudo\b.*(?:\brm\b|\bdelete\b|\bformat\b|\bmkfs\b)/i.test(text)) {
    return {
      action: "Privileged Destructive Command",
      risk: "HIGH",
      category: "System",
      reason: [
        "Root privileges mean errors affect the entire system",
        "Can modify or destroy system-critical files",
        "No user-level safeguards prevent accidental damage",
      ],
      recommendation:
        "Narrow scope to specific paths. Double-check the target. Run as non-root if possible.",
    };
  }

  if (/\bgit\s+(?:merge|pull)\b.*\b(?:main|master)\b/i.test(text)) {
    return {
      action: "Merge into Main Branch",
      risk: "HIGH",
      category: "Version Control",
      reason: [
        "Merging directly may skip required review and approval steps",
        "Could introduce unreviewed conflicts into the protected branch",
        "Branch protection may reject the merge and leave things in a broken state",
      ],
      recommendation:
        "Ensure the PR has required approvals and all CI checks are passing before merging.",
    };
  }

  if (
    /\bdisable\b.*(?:2fa|mfa|firewall|security|auth)\b|\b(?:firewall|ufw|iptables)\b.*(?:disable|stop|off)\b/i.test(
      text
    )
  ) {
    return {
      action: "Security Control Disabled",
      risk: "HIGH",
      category: "Security",
      reason: [
        "Removes an active security layer protecting the system or users",
        "Exposes the system to attacks for the duration it is disabled",
        "Temporary disabling frequently becomes permanent by accident",
      ],
      recommendation:
        "Add specific allow-rules instead of disabling entirely. Set a reminder to re-enable.",
    };
  }

  if (/\bdelete\b.*\.(?:pem|key|cert|p12|env|config)\b/i.test(text)) {
    return {
      action: "Critical File Deletion",
      risk: "HIGH",
      category: "File System",
      reason: [
        "Certificates and private keys cannot be regenerated without re-issuing",
        "Deleting .env or config files immediately breaks dependent services",
        "Multiple systems may fail simultaneously with no warning",
      ],
      recommendation:
        "Archive to a secure location first. Verify no active services depend on the file.",
    };
  }

  if (/\bkill\s+-9\b|\bkillall\b/i.test(text)) {
    return {
      action: "Force Process Termination",
      risk: "HIGH",
      category: "System",
      reason: [
        "SIGKILL does not allow the process to clean up or flush data",
        "May leave locks, temp files, or connections in a broken state",
        "Targeting the wrong PID can kill critical system processes",
      ],
      recommendation:
        "Try SIGTERM (kill -15) first for graceful shutdown. Only use -9 if the process is stuck.",
    };
  }

  // ── MEDIUM ───────────────────────────────────────────────────────────────
  if (/\bgit\s+rebase\b/i.test(text)) {
    return {
      action: "Git Rebase",
      risk: "MEDIUM",
      category: "Version Control",
      reason: [
        "Rewrites commit history — safe locally, problematic on shared branches",
        "Can cause complex conflicts that need careful manual resolution",
        "Teammates must force-pull if a shared branch is rebased",
      ],
      recommendation:
        "Only rebase your own local, unshared branches. Use merge for shared branches.",
    };
  }

  if (
    /\bdocker\s+(?:rm|rmi|system\s+prune|container\s+prune|volume\s+prune)\b/i.test(
      text
    )
  ) {
    return {
      action: "Docker Resource Removal",
      risk: "MEDIUM",
      category: "Infrastructure",
      reason: [
        "May remove containers or images that are actively in use",
        "Could stop running services unexpectedly in shared environments",
        "Container volume data is permanently lost after removal",
      ],
      recommendation:
        "Check running containers with 'docker ps' first. Use --filter to scope the cleanup.",
    };
  }

  if (
    /\bkubectl\s+(?:apply|rollout|scale)\b|\bhelm\s+(?:install|upgrade)\b/i.test(
      text
    )
  ) {
    return {
      action: "Kubernetes State Change",
      risk: "MEDIUM",
      category: "Infrastructure",
      reason: [
        "Modifies live cluster state with immediate effect",
        "May trigger rolling restarts that briefly affect active users",
        "Misconfigured manifests can cause cascading pod failures",
      ],
      recommendation:
        "Run 'kubectl diff' first. Apply to a non-production namespace and verify before promoting.",
    };
  }

  if (/\bsystemctl\s+(?:stop|restart|disable)\s+\w/i.test(text)) {
    return {
      action: "System Service Control",
      risk: "MEDIUM",
      category: "System",
      reason: [
        "Stopping a service causes downtime for all dependent users",
        "Disabled services will not restart automatically on server reboot",
        "Other services may cascade-fail if they depend on this one",
      ],
      recommendation:
        "Check dependencies with 'systemctl list-dependencies'. Notify stakeholders before stopping.",
    };
  }

  if (/\bgit\s+tag\b.*(?:-a|-m)\b/i.test(text)) {
    return {
      action: "Create Annotated Release Tag",
      risk: "MEDIUM",
      category: "Version Control",
      reason: [
        "Tags typically trigger automated release pipelines in CI/CD",
        "Tagging the wrong commit ships incorrect code to users",
        "Deleting pushed tags requires force operations and team coordination",
      ],
      recommendation:
        "Verify the commit SHA is the correct, fully tested release candidate before tagging.",
    };
  }

  if (
    /\bnpm\s+install\b.*(?:http|git\+|github\.com)|\bpip\s+install\b.*(?:http|git\+)/i.test(
      text
    )
  ) {
    return {
      action: "Install Package from Non-Registry Source",
      risk: "MEDIUM",
      category: "Package Management",
      reason: [
        "Source is not subject to standard registry security vetting",
        "Package may contain malicious or untested code",
        "No pinned version guarantee — can change silently at any time",
      ],
      recommendation:
        "Only install from official registries (npm, PyPI). Pin exact versions in lockfiles.",
    };
  }

  if (/\bdelete\s+from\s+\w+/i.test(text)) {
    return {
      action: "SQL DELETE Operation",
      risk: "MEDIUM",
      category: "Database",
      reason: [
        "Permanently removes rows matching the WHERE clause",
        "A missing or incorrect WHERE clause deletes every row in the table",
        "May not be recoverable depending on transaction and backup settings",
      ],
      recommendation:
        "Run as SELECT first to preview affected rows. Wrap in a transaction and test rollback.",
    };
  }

  if (/\bgit\s+(?:branch\s+-[Dd]|push\s+.*--delete)\b/i.test(text)) {
    return {
      action: "Branch Deletion",
      risk: "MEDIUM",
      category: "Version Control",
      reason: [
        "Deleting a remote branch removes it for all collaborators",
        "Any in-progress work on that branch is orphaned",
        "Restoring requires knowing the exact commit SHA",
      ],
      recommendation:
        "Confirm the branch is fully merged. Archive it as a tag before deleting if unsure.",
    };
  }

  if (
    /\bcurl\b.*\|\s*(?:bash|sh|python|node)\b|\bwget\b.*\|\s*(?:bash|sh)\b/i.test(
      text
    )
  ) {
    return {
      action: "Remote Script Execution",
      risk: "MEDIUM",
      category: "Security",
      reason: [
        "Downloads and immediately executes code without prior inspection",
        "Pipe-to-shell bypasses all local security controls",
        "The remote script may change between your download and a teammate's",
      ],
      recommendation:
        "Download the script first, inspect it, then run from local. Use checksums to verify integrity.",
    };
  }

  // ── LOW ──────────────────────────────────────────────────────────────────
  if (
    /\b(?:pytest|jest|mocha|vitest|rspec|go\s+test|cargo\s+test|mvn\s+test|phpunit)\b/i.test(
      text
    ) ||
    /\brun\s+tests?\b/i.test(text)
  ) {
    return {
      action: "Run Test Suite",
      risk: "LOW",
      category: "Development",
      reason: [
        "Tests only read code and state — they do not modify any production system",
      ],
      recommendation: "Safe to execute. Ensure all tests pass before merging.",
    };
  }

  if (
    /\bgit\s+(?:status|log|diff|show|fetch|stash\s+list)\b/i.test(text)
  ) {
    return {
      action: "Read-Only Git Operation",
      risk: "LOW",
      category: "Version Control",
      reason: [
        "This operation only reads repository state without making any changes",
      ],
      recommendation: "Safe to execute.",
    };
  }

  if (
    /\bgit\s+(?:checkout|switch)\b/i.test(text) &&
    !/--force|-f\b/.test(text)
  ) {
    return {
      action: "Branch Checkout / Switch",
      risk: "LOW",
      category: "Version Control",
      reason: [
        "Switching branches only affects the local working directory",
      ],
      recommendation:
        "Safe to execute. Stash or commit in-progress work first to avoid conflicts.",
    };
  }

  if (/\bgit\s+(?:pull|fetch)\b/i.test(text) && !/--force/.test(text)) {
    return {
      action: "Pull / Fetch Remote Changes",
      risk: "LOW",
      category: "Version Control",
      reason: [
        "Fetch downloads remote state. Pull merges it locally — no remote changes are made.",
      ],
      recommendation: "Safe to execute.",
    };
  }

  if (
    /\b(?:ls|pwd|echo|cat\s|head\s|tail\s|grep|find\s|which|env|ps\s|whoami|uname|df\s|du\s|top|htop|wc\s)\b/i.test(
      text
    )
  ) {
    return {
      action: "Read-Only System Command",
      risk: "LOW",
      category: "System",
      reason: [
        "This command reads system information without modifying any state",
      ],
      recommendation: "Safe to execute.",
    };
  }

  if (
    /\bnpm\s+(?:run|start|build|lint|ci|install|update)\b/i.test(text) &&
    !/publish/.test(text)
  ) {
    return {
      action: "NPM Script",
      risk: "LOW",
      category: "Development",
      reason: [
        "Standard development scripts are scoped to the local project directory",
      ],
      recommendation: "Safe to execute in a development environment.",
    };
  }

  if (/\bgit\s+(?:add|commit)\b/i.test(text)) {
    return {
      action: "Stage / Commit Changes",
      risk: "LOW",
      category: "Version Control",
      reason: ["Staging and committing only affects local repository state"],
      recommendation:
        "Safe to execute. Write a clear, descriptive commit message.",
    };
  }

  if (
    /\b(?:curl|wget)\b.*https?:\/\//i.test(text) &&
    !/\|\s*(?:bash|sh|python|node)/.test(text)
  ) {
    return {
      action: "HTTP Request",
      risk: "LOW",
      category: "Development",
      reason: [
        "A plain HTTP read request does not modify any local or remote state",
      ],
      recommendation:
        "Safe to execute. Avoid piping the response directly to a shell interpreter.",
    };
  }

  // ── Default ───────────────────────────────────────────────────────────────
  return {
    action: "Unclassified Action",
    risk: "MEDIUM",
    category: "Unknown",
    reason: [
      "SentinelAI could not match this request to a known action pattern",
      "Unrecognized commands default to medium scrutiny as a safety measure",
    ],
    recommendation:
      "Describe the action in more detail, or request a manual security review before executing.",
  };
}
