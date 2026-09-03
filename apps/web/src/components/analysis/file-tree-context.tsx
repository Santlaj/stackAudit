import { FileCode, ShieldAlert, FileText, ChevronRight } from "lucide-react";

interface RelevantFile {
  file: string;
  role: string;
  source: string;
}

interface FileTreeContextProps {
  files: RelevantFile[];
}

export function FileTreeContext({ files }: FileTreeContextProps) {
  if (!files || files.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic py-2">
        No specific files identified.
      </div>
    );
  }

  // Sort: primary first, then others
  const sortedFiles = [...files].sort((a, b) => {
    if (a.role.toLowerCase() === "primary") return -1;
    if (b.role.toLowerCase() === "primary") return 1;
    return 0;
  });

  return (
    <div className="space-y-3 font-mono text-sm">
      {sortedFiles.map((f, idx) => {
        const isPrimary = f.role.toLowerCase() === "primary";
        return (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {isPrimary ? (
                <ShieldAlert className="h-4 w-4 text-emerald-500" />
              ) : (
                <FileCode className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={isPrimary ? "text-foreground font-medium" : "text-muted-foreground"}>
                {f.file}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground capitalize">
                {f.role} {f.source === "graphify" && "— Found via structural analysis"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
