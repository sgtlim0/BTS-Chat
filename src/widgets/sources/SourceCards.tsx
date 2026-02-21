import type { Source } from "@/entities/message/model";

interface SourceCardsProps {
  sources: Source[];
}

export function SourceCards({ sources }: SourceCardsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-3 mb-3 scrollbar-thin">
      {sources.map((source, idx) => (
        <a
          key={`${source.url}-${idx}`}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-[200px] p-3 bg-source-card-bg border border-border rounded-xl no-underline text-text-primary hover:-translate-y-0.5 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            {source.favicon && (
              <img
                src={source.favicon}
                alt=""
                className="w-4 h-4 rounded-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="text-[11px] text-text-muted truncate">{source.domain}</span>
            <span className="ml-auto text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded-full">
              {idx + 1}
            </span>
          </div>
          <div className="text-[13px] font-medium leading-tight line-clamp-2 group-hover:text-accent transition-colors">
            {source.title}
          </div>
          <div className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
            {source.snippet}
          </div>
        </a>
      ))}
    </div>
  );
}
