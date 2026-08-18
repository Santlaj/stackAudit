import { getAiProvider } from "../../infrastructure/ai/index.js";
import { githubService } from "../github/index.js";
import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { analysisQueue } from "./analysis.queue.js";
import { AppError, InternalError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";

/**
 * Service responsible for orchestrating the analysis of code or repositories.
 * Depends solely on the AIProvider interface, abstracting away the specific provider (Groq, Gemini, etc.).
 */
export class AnalysisService {
  /**
   * Analyzes a repository or code snippet and returns a structured output.
   * 
   * @param codeInput The code or repository context to analyze.
   * @returns Structured analysis result.
   */
  async analyzeCode(codeInput: string): Promise<{ summary: string; rawAnalysis: string }> {
    logger.info("Starting code analysis", { operation: "analyzeCode" });

    if (!codeInput || codeInput.trim().length === 0) {
      throw new AppError("Code input cannot be empty", 400, "ANALYSIS_INVALID_INPUT");
    }

    try {
      const aiProvider = getAiProvider();

      const systemContext = `You are an expert software architect and security auditor.
Analyze the provided code carefully. Provide a concise summary of what the code does, 
followed by any potential security vulnerabilities, performance issues, or architectural flaws.`;

      const result = await aiProvider.analyze({
        prompt: `Please analyze the following code:\n\n${codeInput}`,
        systemContext,
        temperature: 0.2, // Low temperature for more deterministic and analytical response
      });

      // Here you could parse JSON if the provider was instructed to return JSON.
      // For now, we return the raw markdown/text content.
      
      logger.info("Code analysis completed successfully", { operation: "analyzeCode" });
      
      return {
        summary: "Analysis completed successfully.",
        rawAnalysis: result.content,
      };
    } catch (error) {
      logger.error("Analysis service failed to analyze code", { error, operation: "analyzeCode" });
      throw error; // Re-throw to be handled by the global error handler
    }
  }

  /**
   * Triggers a repository analysis by creating a database record and placing
   * a job in the background queue. Returns immediately.
   */
  async analyzeRepository(owner: string, repo: string, token?: string, userId?: string) {
    const fullRepo = `${owner}/${repo}`;
    logger.info("Queuing repository analysis", { owner, repo, fullRepo });

    // 1. Create initial audit record in DB with PENDING status
    const auditRecord = await prisma.audit.create({
      data: {
        repository: fullRepo,
        status: "PENDING",
        userId: userId || null,
      },
    });

    // 2. Add job to BullMQ
    await analysisQueue.add("analyze", {
      auditId: auditRecord.id,
      owner,
      repo,
      token,
      userId,
    });

    return {
      id: auditRecord.id,
      status: auditRecord.status,
      repository: fullRepo,
      message: "Analysis queued successfully. Check back later for results.",
    };
  }

  /**
   * The background worker calls this to perform the actual analysis.
   */
  async processAnalysisJob(auditId: string, owner: string, repo: string, token?: string) {
    logger.info("Starting background repository analysis", { owner, repo, auditId });

    // Update status to PROCESSING
    await prisma.audit.update({
      where: { id: auditId },
      data: { status: "PROCESSING" },
    });

    try {
      // Fetch Repo Metadata
      const repoInfo = await githubService.getRepositoryInfo(owner, repo, token);
      if (!repoInfo || !repoInfo.defaultBranch) {
        throw new InternalError("Failed to resolve repository default branch");
      }

      // Fetch the repository tree structure
      const tree = await githubService.getRepositoryTree(owner, repo, repoInfo.defaultBranch, token);
      
      const coreFiles = (tree || [])
        .filter((node: any) => node.type === "blob")
        .map((node: any) => node.path)
        .filter((path: string) => path.match(/^(package\.json|README\.md|tsconfig\.json|src\/index\.ts|src\/main\.ts)$/i));

      let codeContext = "";
      for (const path of coreFiles) {
        try {
          const file = await githubService.getFileContent(owner, repo, path, token);
          if (file?.content) {
            codeContext += `\n\n--- FILE: ${path} ---\n${file.content}`;
          }
        } catch (fileErr) {
          logger.warn(`Skipped fetching file ${path} during analysis`, { error: fileErr });
        }
      }

      if (codeContext.trim() === "") {
        throw new AppError("No critical files found to analyze.", 400, "ANALYSIS_NO_FILES");
      }

      const systemContext = `You are a Senior Security Architect and Code Reviewer.
Analyze the provided repository files. 
- Provide an architectural summary.
- List exact dependencies that are outdated or insecure.
- Point out any anti-patterns.
Be highly specific and technical. Return your answer in Markdown.`;

      const aiProvider = getAiProvider();
      const result = await aiProvider.analyze({
        prompt: `Repository Metadata:\nName: ${repoInfo.fullName}\nDescription: ${repoInfo.description}\n\nFiles Content:${codeContext}`,
        systemContext,
        temperature: 0.1,
      });

      // Update database record with completed status and output
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: "COMPLETED",
          report: result.content,
        },
      });

      logger.info("Repository analysis completed and saved to DB", { owner, repo, auditId });
    } catch (error: any) {
      logger.error("Failed to analyze repository, updating audit record to FAILED", { error, owner, repo, auditId });
      
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: "FAILED",
          error: error.message || "Unknown analysis error",
        },
      }).catch((dbErr) => {
        logger.error("Failed to record FAILED status in DB", { dbErr });
      });

      throw error;
    }
  }

  /**
   * Retrieve audit report by ID
   */
  async getAuditById(id: string) {
    const auditRecord = await prisma.audit.findUnique({
      where: { id },
    });

    if (!auditRecord) {
      throw new AppError("Audit record not found", 404, "AUDIT_NOT_FOUND");
    }

    return auditRecord;
  }

  /**
   * Retrieve list of audits for a specific repository
   */
  async getAuditsByRepo(repository: string) {
    return prisma.audit.findMany({
      where: { repository },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const analysisService = new AnalysisService();
