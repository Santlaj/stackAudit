import { exec } from "child_process";
import { promisify } from "util";
import { readdir, readFile, stat } from "fs/promises";
import { join, relative, extname, basename } from "path";
import { existsSync } from "fs";
import { logger } from "../../utils/logger.js";

const execAsync = promisify(exec);

export interface GraphifyContext {
  architectureContext: string;
  relevantFiles: Array<{
    file: string;
    role: string;
    source: string;
  }>;
  rawOutput: string;
}

export class GraphifyService {
  private readonly MAX_EXECUTION_TIME_MS = 60000; // 1 minute
  private successfulGraphifyCmd: string | null = null;

  /**
   * Runs Graphify on a local directory to build the knowledge graph.
   * If Graphify CLI is not available or fails, falls back gracefully to structural analysis.
   */
  async buildGraph(tempDir: string): Promise<void> {
    logger.info(`Building graphify knowledge graph in ${tempDir}`);
    
    // Commands to try: graphify, python -m graphify, etc
    const commandsToTry = this.successfulGraphifyCmd ? [this.successfulGraphifyCmd] : [
      `graphify`,
      `python -m graphify`,
      `python3 -m graphify`,
      `py -m graphify`
    ];

    let built = false;
    for (const cmdBase of commandsToTry) {
      try {
        await execAsync(`${cmdBase} .`, { cwd: tempDir, timeout: 15000 });
        if (existsSync(join(tempDir, "graphify-out", "graph.json"))) {
          logger.info(`Graphify build succeeded with command: ${cmdBase} .`);
          this.successfulGraphifyCmd = cmdBase;
          built = true;
          break;
        }
      } catch (err: any) {
        // Continue to next command or fallback
      }
    }

    if (!built) {
      logger.warn(`Graphify CLI not available or exited non-zero; falling back to direct repository analysis for ${tempDir}`);
    }
  }

  /**
   * Queries the Graphify knowledge graph for context relevant to an issue.
   * If Graphify is not present, performs direct AST/filesystem analysis of the repository files.
   */
  async extractContext(tempDir: string, issueTitle: string, issueBody: string): Promise<GraphifyContext> {
    logger.info(`Extracting context for issue: ${issueTitle}`);
    
    const hasGraphJson = existsSync(join(tempDir, "graphify-out", "graph.json"));

    if (hasGraphJson) {
      try {
        const safeTitle = issueTitle.replace(/"/g, '\\"');
        const cmdBase = this.successfulGraphifyCmd || "graphify";
        
        const archResult = await execAsync(`${cmdBase} query "What is the high level architecture of this repository?"`, { cwd: tempDir, timeout: 20000 });
        const architectureContext = archResult.stdout.trim() || "Architecture overview generated from graph.";

        const filesResult = await execAsync(`${cmdBase} query "List the exact file paths that would need to be modified or understood to fix this issue: ${safeTitle}. Return a JSON list of objects with 'file' and 'role' (primary, supporting)."`, { cwd: tempDir, timeout: 20000 });
        const rawOutput = filesResult.stdout.trim();
        let relevantFiles: Array<{ file: string; role: string; source: string }> = [];

        const jsonMatch = rawOutput.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            relevantFiles = parsed.map((item: any) => ({
              file: item.file || "Unknown file",
              role: item.role || "related",
              source: "graphify"
            }));
          }
        }

        if (relevantFiles.length > 0) {
          return {
            architectureContext,
            relevantFiles,
            rawOutput
          };
        }
      } catch (e: any) {
        logger.warn(`Graphify query encountered an issue, falling back to direct filesystem analysis`, { error: e.message });
      }
    }

    // Direct repository filesystem analysis fallback
    return await this.analyzeRepositoryFilesDirectly(tempDir, issueTitle, issueBody);
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
    const ignoreDirs = new Set([".git", "node_modules", ".next", "dist", "build", "coverage", ".turbo", ".cache", "vendor", "__pycache__"]);

    async function walk(dir: string, depth = 0) {
      if (depth > 6 || allFiles.length > 500) return;
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
      } catch (err) {
        // Skip unreadable directories
      }
    }

    await walk(repoDir);

    // 1. Detect project structure & architecture
    let projectDescription = "";
    let detectedFramework = "JavaScript / Web";

    const packageJsonPath = join(repoDir, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        projectDescription = pkg.description || "";
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        if (allDeps.react) detectedFramework = "React";
        else if (allDeps.vue) detectedFramework = "Vue";
        else if (allDeps.express) detectedFramework = "Node.js / Express";
        else detectedFramework = "Node.js / JavaScript";
      } catch {}
    }

    const readmePath = join(repoDir, "README.md");
    if (!projectDescription && existsSync(readmePath)) {
      try {
        const readme = await readFile(readmePath, "utf-8");
        const cleanReadme = readme
          .replace(/<[^>]*>/g, " ")
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")
          .trim();
        const firstPara = cleanReadme.split(/\n\s*\n/).find(p => p.trim() && !p.startsWith("#") && !p.includes("<"));
        if (firstPara) {
          projectDescription = firstPara.replace(/[#*`_]/g, "").replace(/<[^>]*>?/gm, '').trim().substring(0, 200);
        }
      } catch {}
    }

    const topLevelDirs = Array.from(new Set(allFiles.map(f => f.split("/")[0]))).filter(d => !d.includes("."));
    const architectureContext = `The repository is a ${detectedFramework} project containing ${allFiles.length} tracked source files. Key directories include: ${topLevelDirs.slice(0, 6).join(", ") || "root"}.${projectDescription ? ` Purpose: ${projectDescription}` : ""}`;

    // 2. Identify relevant files based on issue title & body
    const queryTerms = `${issueTitle} ${issueBody}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !["the", "and", "for", "with", "this", "that", "good", "first", "issue"].includes(w));

    const scoredFiles: Array<{ file: string; score: number }> = [];

    for (const file of allFiles) {
      const lowerFile = file.toLowerCase();
      const fileName = basename(lowerFile);
      let score = 0;

      for (const term of queryTerms) {
        if (fileName.includes(term)) score += 5;
        else if (lowerFile.includes(term)) score += 2;
      }

      // Boost common entry points and UI components if UI issue
      const isUiIssue = queryTerms.some(t => ["filter", "search", "faq", "ui", "view", "page", "button", "header"].includes(t));
      if (isUiIssue && (lowerFile.includes("faq") || lowerFile.includes("search") || lowerFile.includes("filter"))) {
        score += 8;
      }

      // Code file extensions get priority over assets
      const ext = extname(lowerFile);
      if ([".js", ".jsx", ".ts", ".tsx", ".html", ".vue", ".py"].includes(ext)) {
        score += 1;
      }

      if (score > 0) {
        scoredFiles.push({ file, score });
      }
    }

    scoredFiles.sort((a, b) => b.score - a.score);

    let selectedFiles = scoredFiles.slice(0, 12).map((sf, idx) => ({
      file: sf.file,
      role: idx === 0 ? "primary" : "supporting",
      source: "codebase-analysis"
    }));

    // If no matching files were found, fallback to entry points
    if (selectedFiles.length === 0) {
      const entryPointPatterns = ["index.", "app.", "main.", "faq.", "home."];
      const entryFiles = allFiles.filter(f => entryPointPatterns.some(p => basename(f).toLowerCase().includes(p)));
      const fallbackFiles = (entryFiles.length > 0 ? entryFiles : allFiles.filter(f => !f.includes("test"))).slice(0, 8);

      selectedFiles = fallbackFiles.map((file, idx) => ({
        file,
        role: idx === 0 ? "primary" : "supporting",
        source: "codebase-analysis"
      }));
    }

    return {
      architectureContext,
      relevantFiles: selectedFiles,
      rawOutput: `Analyzed repository layout across ${allFiles.length} files. Identified ${selectedFiles.length} key files for contribution context.`
    };
  }
}

export const graphifyService = new GraphifyService();
