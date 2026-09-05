import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { logger } from "../../utils/logger.js";

// Framework → parent language(s) mapping for GitHub language filter
const FRAMEWORK_LANGUAGE_MAP: Record<string, string[]> = {
  "react": ["JavaScript", "TypeScript"],
  "next.js": ["JavaScript", "TypeScript"],
  "vue": ["JavaScript", "TypeScript"],
  "angular": ["JavaScript", "TypeScript"],
  "svelte": ["JavaScript", "TypeScript"],
  "node.js": ["JavaScript", "TypeScript"],
  "express": ["JavaScript", "TypeScript"],
  "nestjs": ["JavaScript", "TypeScript"],
  "django": ["Python"],
  "flask": ["Python"],
  "fastapi": ["Python"],
  "spring": ["Java", "Kotlin"],
  "rails": ["Ruby"],
  "laravel": ["PHP"],
};

// Framework keywords to match against repo topics and description
const FRAMEWORK_KEYWORDS: Record<string, string[]> = {
  "react": ["react", "reactjs", "react-native"],
  "next.js": ["nextjs", "next-js", "next"],
  "vue": ["vue", "vuejs", "vue-js", "nuxt"],
  "angular": ["angular", "angularjs"],
  "svelte": ["svelte", "sveltekit"],
  "node.js": ["nodejs", "node-js", "node"],
  "express": ["express", "expressjs"],
  "nestjs": ["nestjs", "nest-js"],
  "django": ["django"],
  "flask": ["flask"],
  "fastapi": ["fastapi"],
  "spring": ["spring", "spring-boot", "springboot"],
  "rails": ["rails", "ruby-on-rails"],
  "laravel": ["laravel"],
};

export class MatchingService {
  /**
   * Find candidate issues for a developer from the local database.
   * Now actually filters by techStack (languages + frameworks) and difficulty.
   */
  async findCandidates(
    profile: any,
    languages?: string[],
    frameworks?: string[],
    difficulty?: string
  ) {
    // Build base where clause
    const whereClause: any = { 
      state: "open",
      staleness: { not: "abandoned" }
    };

    // ─── Difficulty filter ───
    const targetDifficulty = difficulty 
      || (profile as any).preferredComplexity 
      || "";
    
    if (targetDifficulty) {
      whereClause.difficultyEstimate = targetDifficulty.toLowerCase();
    }

    // ─── Language filter ───
    // Resolve framework selections to their parent languages
    const effectiveLanguages = new Set<string>();

    if (languages && languages.length > 0) {
      for (const lang of languages) {
        effectiveLanguages.add(lang);
      }
    }

    if (frameworks && frameworks.length > 0) {
      for (const fw of frameworks) {
        const parentLangs = FRAMEWORK_LANGUAGE_MAP[fw.toLowerCase()];
        if (parentLangs) {
          for (const pl of parentLangs) {
            effectiveLanguages.add(pl);
          }
        }
      }
    }

    // If no explicit selections, fall back to profile languages
    if (effectiveLanguages.size === 0) {
      const profileLangs = [
        ...((profile as any).recentLanguages || []),
        ...((profile as any).observedLanguages || []),
        ...((profile as any).currentFocus || []),
      ];
      for (const l of profileLangs) {
        effectiveLanguages.add(l);
      }
    }

    const langArray = [...effectiveLanguages];

    // Use raw SQL for JSON overlap on repoLanguages, falling back to repoLanguage
    // This handles both new rows (with repoLanguages JSON) and legacy rows (only repoLanguage)
    let candidates: any[];

    if (langArray.length > 0) {
      // Build a query that checks:
      //   1. repoLanguages JSON has any key matching the target languages, OR
      //   2. repoLanguage (legacy single string) matches any target language
      const langParams = langArray.map(l => l.toLowerCase());
      
      candidates = await prisma.$queryRawUnsafe(`
        SELECT * FROM "github_issues"
        WHERE "state" = 'open'
          AND ("staleness" IS NULL OR "staleness" != 'abandoned')
          ${targetDifficulty ? `AND "difficultyEstimate" = $2` : ''}
          AND (
            -- Check repoLanguages JSON keys (case-insensitive via lower())
            EXISTS (
              SELECT 1 FROM jsonb_object_keys(COALESCE("repoLanguages", '{}'::jsonb)) AS k
              WHERE lower(k) = ANY($1::text[])
            )
            OR lower("repoLanguage") = ANY($1::text[])
          )
        ORDER BY "repoStars" DESC, "ingestedAt" DESC
        LIMIT 250
      `, langParams, ...(targetDifficulty ? [targetDifficulty.toLowerCase()] : []));
    } else {
      // No language filter — return everything matching difficulty
      candidates = await prisma.github_issue.findMany({
        where: whereClause,
        take: 250,
        orderBy: [
          { repoStars: 'desc' },
          { ingestedAt: 'desc' }
        ]
      });
    }

    return candidates;
  }

  /**
   * Deterministic scoring engine.
   * Returns a normalized score 0-100 and structured reasons/gaps.
   * 
   * Now scores against the full repoLanguages JSON and framework topics.
   */
  scoreMatch(
    profile: any,
    issue: any,
    languages?: string[],
    frameworks?: string[],
    difficulty?: string
  ) {
    let score = 0;
    const reasons: string[] = [];
    const gaps: string[] = [];
    
    // Resolve target languages (explicit selections > profile)
    const targetLanguages = new Set<string>();

    if (languages && languages.length > 0) {
      for (const l of languages) targetLanguages.add(l.toLowerCase());
    }
    if (frameworks && frameworks.length > 0) {
      for (const fw of frameworks) {
        const parents = FRAMEWORK_LANGUAGE_MAP[fw.toLowerCase()];
        if (parents) for (const p of parents) targetLanguages.add(p.toLowerCase());
      }
    }
    if (targetLanguages.size === 0) {
      const profileLangs = [
        ...((profile as any).recentLanguages || []),
        ...((profile as any).observedLanguages || []),
        ...((profile as any).currentFocus || []),
      ];
      for (const l of profileLangs) targetLanguages.add(l.toLowerCase());
    }

    const targetDifficulty = difficulty 
      ? difficulty.toLowerCase() 
      : ((profile as any).preferredComplexity || "").toLowerCase();

    // ─── 1. Language Match (Weight: 35%) ───
    // Score based on repoLanguages JSON (full breakdown) rather than single field
    const repoLangs: Record<string, number> = (issue as any).repoLanguages || {};
    const repoLangKeys = Object.keys(repoLangs).map(k => k.toLowerCase());
    const totalBytes = Object.values(repoLangs).reduce((sum: number, b: any) => sum + (Number(b) || 0), 0);

    if (repoLangKeys.length > 0 && targetLanguages.size > 0) {
      const matchingKeys = repoLangKeys.filter(k => targetLanguages.has(k));
      
      if (matchingKeys.length > 0) {
        // Score proportionally to how much of the repo is in the matching language(s)
        const matchingBytes = matchingKeys.reduce((sum, k) => {
          const originalKey = Object.keys(repoLangs).find(ok => ok.toLowerCase() === k);
          return sum + (originalKey ? Number(repoLangs[originalKey]) : 0);
        }, 0);
        const proportion = totalBytes > 0 ? matchingBytes / totalBytes : 0;

        if (proportion > 0.5) {
          score += 35;
          const matchedNames = matchingKeys.map(k => {
            return Object.keys(repoLangs).find(ok => ok.toLowerCase() === k) || k;
          });
          reasons.push(`Strong language match: ${matchedNames.join(", ")} (${Math.round(proportion * 100)}% of codebase).`);
        } else if (proportion > 0.1) {
          score += 25;
          reasons.push(`Partial language match: matching languages represent ${Math.round(proportion * 100)}% of codebase.`);
        } else {
          score += 15;
          reasons.push(`Minor language presence in this repository.`);
        }
      } else {
        gaps.push(`Repository languages (${repoLangKeys.slice(0, 3).join(", ")}) don't overlap with your tech stack.`);
      }
    } else if (issue.repoLanguage && targetLanguages.has(issue.repoLanguage.toLowerCase())) {
      // Fallback to legacy single language field
      score += 30;
      reasons.push(`The primary language (${issue.repoLanguage}) matches your technology stack.`);
    } else if (issue.repoLanguage) {
      gaps.push(`The primary language is ${issue.repoLanguage}, which isn't in your active stack.`);
    } else {
      gaps.push(`The repository language is not specified.`);
    }

    // ─── 1b. Framework Bonus (up to +10) ───
    if (frameworks && frameworks.length > 0) {
      const repoTopics: string[] = ((issue as any).repoTopics || []).map((t: string) => t.toLowerCase());
      const repoDesc: string = ((issue as any).repoDescription || "").toLowerCase();

      for (const fw of frameworks) {
        const keywords = FRAMEWORK_KEYWORDS[fw.toLowerCase()] || [];
        const topicMatch = keywords.some(kw => repoTopics.includes(kw));
        const descMatch = keywords.some(kw => repoDesc.includes(kw));
        
        if (topicMatch || descMatch) {
          score += 10;
          reasons.push(`Repository uses ${fw} (matched via ${topicMatch ? "topics" : "description"}).`);
          break; // Only count once
        }
      }
    }

    // ─── 2. Difficulty Match (Weight: 20%) ───
    const diff = issue.difficultyEstimate;
    
    if (diff && targetDifficulty) {
      if (diff.toLowerCase() === targetDifficulty) {
        score += 20;
        reasons.push(`This is a ${diff}-friendly issue, matching your preference.`);
      } else {
        gaps.push(`Issue difficulty (${diff}) does not perfectly align with your preference (${targetDifficulty}).`);
      }
    } else if (!diff) {
      gaps.push(`The issue difficulty is not explicitly known.`);
    }

    // ─── 3. Contribution Type (Weight: 15%) ───
    const type = issue.issueType; 
    const prefTypes = ((profile as any).preferredContributionTypes || []).map((t: string) => t.toLowerCase());
    
    if (type && prefTypes.some((pt: string) => pt.includes(type) || type.includes(pt))) {
      score += 15;
      reasons.push(`This is a ${type} issue, which matches your preferred contribution types.`);
    } else if (type) {
      gaps.push(`The issue is a ${type}, which is not in your preferred contribution types.`);
    } else {
      gaps.push(`The contribution type is unclear.`);
    }

    // ─── 4. Repository Activity (Weight: 10%) ───
    if (issue.repoActivityLevel === "active") {
      score += 10;
      reasons.push(`Repository is highly active and actively maintained.`);
    } else if (issue.repoActivityLevel === "moderate") {
      score += 5;
      reasons.push(`Repository has moderate activity.`);
    } else if (issue.repoActivityLevel === "inactive") {
      gaps.push(`Repository appears inactive. Reviewing PRs may be slow.`);
    } else {
      gaps.push(`Repository activity is low or unknown.`);
    }

    // ─── 5. Issue Freshness (Weight: 10%) ───
    if (issue.staleness === "fresh") {
      score += 10;
      reasons.push(`The issue is recently created or updated.`);
    } else if (issue.staleness === "aging") {
      score += 5;
      reasons.push(`The issue has been open for a while but isn't stale.`);
    } else if (issue.staleness === "stale") {
      gaps.push(`The issue is stale and might be outdated.`);
    } else {
      gaps.push(`Issue freshness is unknown.`);
    }

    // ─── 6. PR Acceptance Rate (Weight: 10%) ───
    if (issue.repoPrAcceptanceRate !== null && issue.repoPrAcceptanceRate !== undefined) {
      if (issue.repoPrAcceptanceRate > 70) {
        score += 10;
        reasons.push(`High PR acceptance rate (${Math.round(issue.repoPrAcceptanceRate)}%), meaning contributions are likely to be merged.`);
      } else if (issue.repoPrAcceptanceRate > 40) {
        score += 5;
      } else {
        gaps.push(`Low PR acceptance rate (${Math.round(issue.repoPrAcceptanceRate)}%). Your contribution might take longer to review.`);
      }
    } else {
      gaps.push(`PR acceptance rate is unknown.`);
    }

    // Normalize — with framework bonus, max can be 110, so cap at 100
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return { score, reasons, gaps };
  }
}

export const matchingService = new MatchingService();
