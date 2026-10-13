import { readdir, readFile } from "fs/promises";
import { join, relative, extname, basename } from "path";
import { existsSync } from "fs";
import { logger } from "../../utils/logger.js";

export interface GraphifyContext {
  architectureContext: string;
  relevantFiles: Array<{
    file: string;
    role: string;
    source: string;
    snippet?: string;
  }>;
  rawOutput: string;
}

/**
 * Native Codebase Intelligence Engine.
 * 
 * Replaces fragile external Python CLI spawns with a pure in-process, high-performance
 * TypeScript analyzer that inspects project manifests (Node, Rust, Go, Python), maps
 * directory architecture, and deterministically ranks files relevant to an open-source issue.
 */
export class GraphifyService {
  /**
   * Builds repository context index.
   * With the native TypeScript engine, index generation is instantaneous (<30ms).
   */
  async buildGraph(tempDir: string): Promise<void> {
    logger.info(`[CodebaseIntelligence] Initializing architecture & structure scanner for ${tempDir}`);
    // Native engine operates directly on the cloned filesystem without external compilation steps
  }

  /**
   * Extracts contextual repository architecture directly from an in-memory file list and manifests (sub-10ms).
   */
  async extractContextFromTree(
    filePaths: string[],
    manifests: { packageJson?: string; readme?: string },
    issueTitle: string,
    issueBody: string
  ): Promise<GraphifyContext> {
    const startTime = Date.now();
    logger.info(`[CodebaseIntelligence] Analyzing in-memory file tree for issue: "${issueTitle.substring(0, 60)}"`);

    const context = this.computeContext(filePaths, issueTitle, issueBody, manifests);
    const duration = Date.now() - startTime;

    logger.info(
      `[CodebaseIntelligence] In-memory analysis complete in ${duration}ms: identified ${context.relevantFiles.length} relevant files.`
    );
    return context;
  }

  /**
   * Extracts contextual repository architecture and files relevant to an open-source issue from disk.
   */
  async extractContext(tempDir: string, issueTitle: string, issueBody: string): Promise<GraphifyContext> {
    const startTime = Date.now();
    logger.info(`[CodebaseIntelligence] Analyzing repository files on disk for issue: "${issueTitle.substring(0, 60)}"`);
    
    const context = await this.analyzeRepositoryFilesDirectly(tempDir, issueTitle, issueBody);
    const duration = Date.now() - startTime;
    
    logger.info(
      `[CodebaseIntelligence] Analysis complete in ${duration}ms: identified ${context.relevantFiles.length} relevant files.`
    );
    return context;
  }

  /**
   * Direct repository file analyzer that inspects the cloned files on disk.
   */
  private async analyzeRepositoryFilesDirectly(
    repoDir: string, 
    issueTitle: string, 
    issueBody: string
  ): Promise<GraphifyContext> {
    const allFiles: string[] = [];
    const ignoreDirs = new Set([
      ".git", 
      "node_modules", 
      ".next", 
      "dist", 
      "build", 
      "coverage", 
      ".turbo", 
      ".cache", 
      "vendor", 
      "__pycache__",
      ".venv",
      "target"
    ]);

    async function walk(dir: string, depth = 0) {
      if (depth > 7 || allFiles.length > 800) return;
      try {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (ignoreDirs.has(entry.name)) continue;
          const fullPath = join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(fullPath, depth + 1);
          } else if (entry.isFile()) {
            allFiles.push(relative(repoDir, fullPath).replace(/\\/g, "/"));
          }
        }
      } catch {
        // Skip unreadable directories
      }
    }

    await walk(repoDir);

    let packageJson: string | undefined;
    let readme: string | undefined;

    const pkgPath = join(repoDir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        packageJson = await readFile(pkgPath, "utf-8");
      } catch {}
    }

    const readmeCandidates = ["README.md", "readme.md", "README", "Readme.md"];
    for (const rName of readmeCandidates) {
      const rPath = join(repoDir, rName);
      if (existsSync(rPath)) {
        try {
          readme = await readFile(rPath, "utf-8");
          break;
        } catch {}
      }
    }

    return this.computeContext(allFiles, issueTitle, issueBody, { packageJson, readme });
  }

  /**
   * Core deterministic scoring and architecture detection engine.
   */
  private computeContext(
    allFiles: string[],
    issueTitle: string,
    issueBody: string,
    manifests: { packageJson?: string; readme?: string }
  ): GraphifyContext {
    // 1. Detect project structure & architecture
    let projectDescription = "";
    let detectedFramework = "Software Project";

    // 1a. Node / JavaScript / TypeScript Ecosystem
    if (manifests.packageJson) {
      try {
        const pkg = JSON.parse(manifests.packageJson);
        projectDescription = pkg.description || "";
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        
        if (allDeps.next) detectedFramework = "Next.js / React";
        else if (allDeps.react) detectedFramework = "React";
        else if (allDeps.vue) detectedFramework = "Vue.js";
        else if (allDeps["@nestjs/core"]) detectedFramework = "NestJS";
        else if (allDeps.express) detectedFramework = "Node.js / Express";
        else if (allDeps.fastify) detectedFramework = "Node.js / Fastify";
        else if (allDeps.typescript) detectedFramework = "TypeScript / Node.js";
        else detectedFramework = "JavaScript / Node.js";
      } catch {}
    } 
    // 1b. Python Ecosystem
    else if (allFiles.some(f => f.includes("pyproject.toml") || f.includes("requirements.txt"))) {
      detectedFramework = "Python";
    } 
    // 1c. Rust Ecosystem
    else if (allFiles.some(f => f.includes("Cargo.toml"))) {
      detectedFramework = "Rust";
    } 
    // 1d. Go Ecosystem
    else if (allFiles.some(f => f.includes("go.mod"))) {
      detectedFramework = "Go";
    }

    // README fallback for project overview
    if (!projectDescription && manifests.readme) {
      try {
        const cleanReadme = manifests.readme
          .replace(/<[^>]*>/g, " ")
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .trim();
        const firstPara = cleanReadme.split(/\n\s*\n/).find(p => p.trim() && !p.startsWith("#") && !p.includes("<"));
        if (firstPara) {
          projectDescription = firstPara.replace(/[#*`_]/g, "").replace(/<[^>]*>?/gm, '').trim().substring(0, 220);
        }
      } catch {}
    }

    const topLevelDirs = Array.from(new Set(allFiles.map(f => f.split("/")[0]))).filter(d => !d.includes("."));
    const architectureContext = `The repository is a ${detectedFramework} project containing ${allFiles.length} tracked source files. Key directories include: ${topLevelDirs.slice(0, 8).join(", ") || "root"}.${projectDescription ? ` Purpose: ${projectDescription}` : ""}`;

    // 2. Identify relevant files based on issue title & body
    const stopWords = new Set([
      "the", "and", "for", "with", "this", "that", "good", "first", "issue", "bug", 
      "fix", "error", "failed", "when", "after", "before", "from", "into", "need", 
      "should", "would", "could", "have", "been", "does", "doesn", "what", "where"
    ]);

    const queryTerms = `${issueTitle} ${issueBody}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w));

    const scoredFiles: Array<{ file: string; score: number; reasons: string[] }> = [];

    for (const file of allFiles) {
      const lowerFile = file.toLowerCase();
      const fileName = basename(lowerFile);
      let score = 0;
      const reasons: string[] = [];

      for (const term of queryTerms) {
        if (fileName.includes(term)) {
          score += 6;
          reasons.push(`Filename matches "${term}"`);
        } else if (lowerFile.includes(term)) {
          score += 2.5;
          reasons.push(`Path matches "${term}"`);
        }
      }

      // Boost common UI/API keywords if present in issue
      const isUiIssue = queryTerms.some(t => ["filter", "search", "modal", "page", "button", "header", "table", "view"].includes(t));
      if (isUiIssue && (lowerFile.includes("component") || lowerFile.includes("ui") || lowerFile.includes("view") || lowerFile.includes("page"))) {
        score += 3;
      }

      // Code file extensions get priority over assets and configs
      const ext = extname(lowerFile);
      if ([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java"].includes(ext)) {
        score += 2;
      } else if ([".json", ".yaml", ".yml", ".toml"].includes(ext)) {
        score += 0.5;
      } else if ([".png", ".jpg", ".svg", ".ico", ".lock"].includes(ext)) {
        score -= 5; // Demote static assets
      }

      // Prefer non-test files for primary changes
      const isTestFile = lowerFile.includes("test") || lowerFile.includes("spec") || lowerFile.includes("__tests__");
      if (isTestFile && score > 0) {
        score -= 1;
      }

      if (score > 1) {
        scoredFiles.push({ file, score, reasons });
      }
    }

    scoredFiles.sort((a, b) => b.score - a.score);

    let selectedFiles = scoredFiles.slice(0, 10).map((sf, idx) => {
      const lower = sf.file.toLowerCase();
      const isTest = lower.includes("test") || lower.includes("spec");
      return {
        file: sf.file,
        role: idx === 0 ? "primary" : isTest ? "test" : "supporting",
        source: "codebase-intelligence"
      };
    });

    // If no matching files were found, fallback to entry points and core directories
    if (selectedFiles.length === 0) {
      const entryPointPatterns = ["index.", "app.", "main.", "server.", "core."];
      const entryFiles = allFiles.filter(f => entryPointPatterns.some(p => basename(f).toLowerCase().includes(p)));
      const fallbackFiles = (entryFiles.length > 0 ? entryFiles : allFiles.filter(f => !f.includes("test"))).slice(0, 6);

      selectedFiles = fallbackFiles.map((file, idx) => ({
        file,
        role: idx === 0 ? "primary" : "supporting",
        source: "codebase-intelligence"
      }));
    }

    return {
      architectureContext,
      relevantFiles: selectedFiles,
      rawOutput: `Analyzed repository layout across ${allFiles.length} files. Identified ${selectedFiles.length} candidate files relevant to issue scope.`
    };
  }
}

export const graphifyService = new GraphifyService();
