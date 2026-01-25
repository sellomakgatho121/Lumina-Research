# Specification - Modularize and Refactor ResearchAssistant

## Overview
The goal of this track is to refactor the `ResearchAssistant.tsx` component by extracting its logic and UI into smaller, focused components. This will improve maintainability, testability, and adherence to the project's aesthetic goals.

## Scope
- Extract `ResearchHeader` for the top branding and greeting.
- Extract `SearchInput` for the complex search bar, including dictation and mode toggles.
- Extract `ResearchResults` for rendering markdown and source references.
- Create `SavedSearches` to manage historical search sessions.
- Update `ResearchAssistant.tsx` to act as a lightweight orchestrator.

## Technical Requirements
- Maintain existing state logic using React hooks.
- Ensure all new components follow the `Holographic & Futuristic` visual guidelines.
- Use TypeScript for all new component props and state.
- Adhere to the `Professional & Academic` communication style in any user-facing text.
