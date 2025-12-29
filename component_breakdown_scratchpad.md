This file is a planning scratchpad for breaking down ResearchAssistant.tsx.

## Components to Create

### 1. components/research/ResearchHeader.tsx
- Props: None
- Renders: "What will you discover today?" + Gemini Badge

### 2. components/research/SearchInput.tsx
- Props:
  - query: string
  - setQuery: (q: string) => void
  - onSearch: () => void
  - loading: boolean
  - isListening: boolean
  - toggleDictation: () => void
  - options: SearchOptions
  - setOptions: (o: SearchOptions) => void
  - mode: 'standard' | 'maps' | 'deep'
  - setMode: (m: 'standard' | 'maps' | 'deep') => void
  - onSave: () => void
- Renders: The main input area + advanced options + mode toggles.

### 3. components/research/ResearchResults.tsx
- Props:
  - result: ResearchResult | null
  - deepResult: string | null
  - loading: boolean (maybe skeleton?)
  - theme: ThemePreset
  - customTheme: CustomTheme
- Renders: The markdown content, sources, and images.

### 4. components/research/SavedSearches.tsx
- Props:
  - searches: SavedSearch[]
  - onLoad: (s: SavedSearch) => void
  - onDelete: (id: string) => void
- Renders: The dropdown/list of stored searches.

### 5. ResearchAssistant.tsx (Orchestrator)
- Holds all the state (query, results, gemini service calls).
- Imports the above components.
