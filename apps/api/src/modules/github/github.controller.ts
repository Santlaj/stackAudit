import { Request, Response, NextFunction } from "express";
import { githubService } from "./github.service.js";

export class GithubController {
  /**
   * GET /api/github/repo/:owner/:repo
   */
  async getRepoInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { owner, repo } = req.params;
      
      // If we had user auth, we would pass req.user.githubToken
      const info = await githubService.getRepositoryInfo(owner as string, repo as string);
      
      res.json({
        success: true,
        data: info,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/github/repo/:owner/:repo/contents/*
   */
  async getFileContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { owner, repo } = req.params;
      const path = req.params.path as string; // Gets the wildcard path and asserts it as string
      
      const file = await githubService.getFileContent(owner as string, repo as string, path);
      
      res.json({
        success: true,
        data: file,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const githubController = new GithubController();
