"""
SentinelAI Backend — Zero Trust Risk Analysis API
"""

import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SentinelAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    input: str


class AnalyzeResponse(BaseModel):
    action: str
    risk: str
    reason: list[str]
    recommendation: str
    category: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    return _classify(req.input)


def _classify(text: str) -> AnalyzeResponse:
    t = text.lower().strip()

    # ── CRITICAL ─────────────────────────────────────────────────────────
    if re.search(r"\brm\s+-rf\b", t):
        return AnalyzeResponse(
            action="Recursive Force Delete",
            risk="CRITICAL",
            category="File System",
            reason=[
                "Recursively removes files without any confirmation prompt",
                "Cannot be undone — no recycle bin or recovery path",
                "A single wrong path can wipe critical system directories",
            ],
            recommendation="Move files to an archive directory first, or ensure a verified backup exists.",
        )

    if re.search(r"\bgit\s+push\b.*--force\b|force[\s-]push", t):
        return AnalyzeResponse(
            action="Force Git Push",
            risk="CRITICAL",
            category="Version Control",
            reason=[
                "Rewrites shared remote history for all collaborators",
                "Permanently destroys commits made by other developers",
                "Can corrupt the shared repository and invalidate open PRs",
            ],
            recommendation="Use --force-with-lease and coordinate with the team. Consider a revert commit instead.",
        )

    if re.search(r"\bdrop\s+(table|database|schema)\b", t):
        return AnalyzeResponse(
            action="Database Object Destruction",
            risk="CRITICAL",
            category="Database",
            reason=[
                "Permanently destroys the database object and all contained data",
                "Data loss is irreversible without a verified backup",
                "Immediately breaks all services that depend on the dropped object",
            ],
            recommendation="Export a full backup first. Use a migration script with a tested rollback path.",
        )

    if re.search(r"\btruncate\s+(table\s+)?\w", t):
        return AnalyzeResponse(
            action="Table Truncation",
            risk="CRITICAL",
            category="Database",
            reason=[
                "Removes all rows instantly and permanently",
                "Cannot be rolled back in most database engines once committed",
                "May violate foreign key constraints and cascade to other tables",
            ],
            recommendation="Export the data first. Prefer soft deletes (is_deleted flag) for production tables.",
        )

    if re.search(r"(echo|print|log|export)\s+.*(api[_-]?key|secret|password|token|private[_-]?key)", t):
        return AnalyzeResponse(
            action="Credentials Exposure",
            risk="CRITICAL",
            category="Security",
            reason=[
                "Prints sensitive credentials to stdout, logs, or the environment",
                "Credentials in output are captured by monitoring and logging tools",
                "Leaked credentials require immediate rotation across all systems",
            ],
            recommendation="Use a secrets manager. Never print credentials. Rotate immediately if exposed.",
        )

    if re.search(r"\bkubectl\s+delete\s+(namespace|ns|cluster)\b", t):
        return AnalyzeResponse(
            action="Kubernetes Namespace Deletion",
            risk="CRITICAL",
            category="Infrastructure",
            reason=[
                "Deletes all pods, services, and resources in the namespace immediately",
                "Causes instant production outage for all affected services",
                "Full recovery requires a complete redeployment from scratch",
            ],
            recommendation="Scale deployments to 0 first. Document all resources. Obtain explicit team approval.",
        )

    if re.search(r"(delete\s+all|purge\s+all|wipe\s+(all|everything|database|data))", t):
        return AnalyzeResponse(
            action="Bulk Data Destruction",
            risk="CRITICAL",
            category="Database",
            reason=[
                "Indiscriminate deletion of all data with no targeted scope",
                "Affects every record — selective recovery is impossible after the fact",
                "May violate data retention compliance requirements",
            ],
            recommendation="Scope with a WHERE clause. Archive first. Run in a transaction you can roll back.",
        )

    # ── HIGH ─────────────────────────────────────────────────────────────
    if re.search(r"\bgit\s+push\b", t) and re.search(r"\b(main|master)\b", t) and "--force" not in t:
        return AnalyzeResponse(
            action="Direct Push to Main Branch",
            risk="HIGH",
            category="Version Control",
            reason=[
                "Bypasses the pull request and code review workflow",
                "Unreviewed code goes directly to the primary branch",
                "May violate branch protection rules and CODEOWNERS policies",
            ],
            recommendation="Open a pull request from a feature branch and request at least one reviewer.",
        )

    if re.search(r"\bgit\s+reset\s+--hard\b", t):
        return AnalyzeResponse(
            action="Hard Git Reset",
            risk="HIGH",
            category="Version Control",
            reason=[
                "Permanently discards all uncommitted changes in the working directory",
                "Cannot be undone for unstaged work — no safety net exists",
                "Staged changes are also lost without stashing first",
            ],
            recommendation="Use git stash to preserve changes, or git reset --soft to keep them staged.",
        )

    if re.search(r"\bdeploy\b.*\bprod(uction)?\b|\brelease\b.*\bprod(uction)?\b", t) and not re.search(
        r"staging|canary|rollback|dry.run", t
    ):
        return AnalyzeResponse(
            action="Production Deployment",
            risk="HIGH",
            category="Infrastructure",
            reason=[
                "Directly affects live users with immediate effect",
                "Untested changes may introduce regressions at scale",
                "Rollbacks can take significant time during an active outage",
            ],
            recommendation="Deploy to staging first. Verify smoke tests pass. Use canary or blue-green releases.",
        )

    if re.search(r"\bnpm\s+publish\b|\bpip\s+upload\b|\bgem\s+push\b", t):
        return AnalyzeResponse(
            action="Package Publication",
            risk="HIGH",
            category="Package Management",
            reason=[
                "Published packages are immediately public and globally accessible",
                "Versions cannot be unpublished once widely downloaded",
                "May accidentally expose internal code, configs, or credentials",
            ],
            recommendation="Run with --dry-run first. Audit .npmignore. Verify semver bump is correct.",
        )

    if re.search(r"\bchmod\s+(777|a\+rwx|o\+w)\b", t):
        return AnalyzeResponse(
            action="Insecure File Permissions",
            risk="HIGH",
            category="Security",
            reason=[
                "Grants full read, write, and execute access to all system users",
                "Creates a significant privilege escalation attack surface",
                "Violates the principle of least privilege",
            ],
            recommendation="Use minimum required permissions: 644 for files, 755 for executables.",
        )

    if re.search(r"\bkill\s+-9\b|\bkillall\b", t):
        return AnalyzeResponse(
            action="Force Process Termination",
            risk="HIGH",
            category="System",
            reason=[
                "SIGKILL does not allow the process to clean up or flush data",
                "May leave locks, temp files, or connections in a broken state",
                "Targeting the wrong PID can kill critical system processes",
            ],
            recommendation="Try SIGTERM (kill -15) first for graceful shutdown. Use -9 only if stuck.",
        )

    # ── MEDIUM ───────────────────────────────────────────────────────────
    if re.search(r"\bgit\s+rebase\b", t):
        return AnalyzeResponse(
            action="Git Rebase",
            risk="MEDIUM",
            category="Version Control",
            reason=[
                "Rewrites commit history — safe locally, problematic on shared branches",
                "Can cause complex conflicts that need careful manual resolution",
                "Teammates must force-pull if a shared branch is rebased",
            ],
            recommendation="Only rebase local, unshared branches. Use merge for shared branches.",
        )

    if re.search(r"\bdocker\s+(rm|rmi|system\s+prune|container\s+prune|volume\s+prune)\b", t):
        return AnalyzeResponse(
            action="Docker Resource Removal",
            risk="MEDIUM",
            category="Infrastructure",
            reason=[
                "May remove containers or images that are actively in use",
                "Could stop running services unexpectedly in shared environments",
                "Container volume data is permanently lost after removal",
            ],
            recommendation="Check running containers with 'docker ps' first. Use --filter to scope cleanup.",
        )

    if re.search(r"\bkubectl\s+(apply|rollout|scale)\b|\bhelm\s+(install|upgrade)\b", t):
        return AnalyzeResponse(
            action="Kubernetes State Change",
            risk="MEDIUM",
            category="Infrastructure",
            reason=[
                "Modifies live cluster state with immediate effect",
                "May trigger rolling restarts that briefly affect active users",
                "Misconfigured manifests can cause cascading pod failures",
            ],
            recommendation="Run 'kubectl diff' first. Apply to a non-production namespace and verify.",
        )

    if re.search(r"\bsystemctl\s+(stop|restart|disable)\s+\w", t):
        return AnalyzeResponse(
            action="System Service Control",
            risk="MEDIUM",
            category="System",
            reason=[
                "Stopping a service causes downtime for all dependent users",
                "Disabled services will not restart automatically on server reboot",
                "Other services may cascade-fail if they depend on this one",
            ],
            recommendation="Check dependencies with 'systemctl list-dependencies'. Notify stakeholders.",
        )

    if re.search(r"\bdelete\s+from\s+\w+", t):
        return AnalyzeResponse(
            action="SQL DELETE Operation",
            risk="MEDIUM",
            category="Database",
            reason=[
                "Permanently removes rows matching the WHERE clause",
                "A missing or incorrect WHERE clause deletes every row in the table",
                "May not be recoverable depending on transaction and backup settings",
            ],
            recommendation="Run as SELECT first to preview affected rows. Wrap in a transaction.",
        )

    if re.search(r"\bcurl\b.*\|\s*(bash|sh|python|node)\b|\bwget\b.*\|\s*(bash|sh)\b", t):
        return AnalyzeResponse(
            action="Remote Script Execution",
            risk="MEDIUM",
            category="Security",
            reason=[
                "Downloads and immediately executes code without prior inspection",
                "Pipe-to-shell bypasses all local security controls",
                "The remote script may change between your download and a teammate's",
            ],
            recommendation="Download the script first, inspect it, then run from local.",
        )

    # ── LOW ──────────────────────────────────────────────────────────────
    if re.search(r"\b(pytest|jest|mocha|vitest|rspec|go\s+test|cargo\s+test)\b", t) or re.search(
        r"\brun\s+tests?\b", t
    ):
        return AnalyzeResponse(
            action="Run Test Suite",
            risk="LOW",
            category="Development",
            reason=["Tests only read code and state — they do not modify any production system"],
            recommendation="Safe to execute. Ensure all tests pass before merging.",
        )

    if re.search(r"\bgit\s+(status|log|diff|show|fetch|stash\s+list)\b", t):
        return AnalyzeResponse(
            action="Read-Only Git Operation",
            risk="LOW",
            category="Version Control",
            reason=["This operation only reads repository state without making any changes"],
            recommendation="Safe to execute.",
        )

    if re.search(r"\bgit\s+(checkout|switch)\b", t) and "--force" not in t:
        return AnalyzeResponse(
            action="Branch Checkout / Switch",
            risk="LOW",
            category="Version Control",
            reason=["Switching branches only affects the local working directory"],
            recommendation="Safe to execute. Stash in-progress work first to avoid conflicts.",
        )

    if re.search(r"\b(ls|pwd|echo|cat\s|grep|find\s|which|env|ps\s|whoami|uname|df\s|du\s)\b", t):
        return AnalyzeResponse(
            action="Read-Only System Command",
            risk="LOW",
            category="System",
            reason=["This command reads system information without modifying any state"],
            recommendation="Safe to execute.",
        )

    if re.search(r"\bnpm\s+(run|start|build|lint|ci|install)\b", t) and "publish" not in t:
        return AnalyzeResponse(
            action="NPM Script",
            risk="LOW",
            category="Development",
            reason=["Standard development scripts are scoped to the local project directory"],
            recommendation="Safe to execute in a development environment.",
        )

    if re.search(r"\bgit\s+(add|commit)\b", t):
        return AnalyzeResponse(
            action="Stage / Commit Changes",
            risk="LOW",
            category="Version Control",
            reason=["Staging and committing only affects local repository state"],
            recommendation="Safe to execute. Write a clear, descriptive commit message.",
        )

    # Default
    return AnalyzeResponse(
        action="Unclassified Action",
        risk="MEDIUM",
        category="Unknown",
        reason=[
            "SentinelAI could not match this request to a known action pattern",
            "Unrecognized commands default to medium scrutiny as a safety measure",
        ],
        recommendation="Describe the action in more detail, or request a manual security review.",
    )
