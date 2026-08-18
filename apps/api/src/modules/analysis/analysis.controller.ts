import { Request, Response, NextFunction } from "express";
import { analysisService } from "./analysis.service.js";

export class AnalysisController {
  /**
   * POST /api/analysis/repo/:owner/:repo
   */
  async triggerRepositoryAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { owner, repo } = req.params;
      
      const result = await analysisService.analyzeRepository(owner, repo);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/:id
   */
  async getAuditById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const audit = await analysisService.getAuditById(id as string);
      
      res.json({
        success: true,
        data: audit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analysis/repo/:owner/:repo
   */
  async getAuditsByRepo(req: Request, res: Response, next: NextFunction) {
    try {
      const { owner, repo } = req.params;
      const audits = await analysisService.getAuditsByRepo(`${owner}/${repo}`);
      
      res.json({
        success: true,
        data: audits,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analysisController = new AnalysisController();
