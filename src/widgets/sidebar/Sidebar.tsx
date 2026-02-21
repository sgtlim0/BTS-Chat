import { useChatStore } from "@/shared/store/chatStore";
import { ConversationList } from "./ConversationList";
import { SearchPanel } from "./SearchPanel";
import { useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { debounce } from "@/shared/lib/debounce";

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { createSession, searchQuery, setSearchQuery } = useChatStore();
  const [showSearch, setShowSearch] = useState(false);

  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setShowSearch(value.length > 0);
    }, 300),
    [setSearchQuery]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update display immediately but debounce the actual search
    setSearchQuery(value);
    debouncedSetSearch(value);
    if (value.length === 0) {
      setShowSearch(false);
    }
  };

  return (
    <aside
      className={`bg-sidebar-bg flex flex-col overflow-hidden transition-all duration-200 border-r border-border ${
        collapsed ? "w-0 min-w-0" : "w-[280px] min-w-[280px]"
      }`}
    >
      <div className="p-4 flex gap-2">
        <button
          className="flex-1 py-2.5 px-4 bg-accent text-white border-none rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 hover:bg-accent-hover transition-colors"
          onClick={() => createSession()}
          aria-label="New chat"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      <div className="relative mx-4 mb-3">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted flex items-center">
          <Search size={14} />
        </span>
        <input
          className="w-full py-2.5 pr-3.5 pl-8 bg-bg-tertiary border border-border rounded-lg text-text-primary text-[13px] outline-none placeholder:text-text-muted focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search messages"
        />
      </div>

      {showSearch && searchQuery ? (
        <SearchPanel
          onClose={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}
        />
      ) : (
        <ConversationList />
      )}
    </aside>
  );
}
