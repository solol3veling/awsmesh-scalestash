# Diagram Persistence System

## Overview

The diagram persistence system is a **pluggable, non-invasive** solution that automatically saves and restores your AWS architecture diagrams using browser localStorage.

## Features

### 1. **Automatic State Persistence**
- Auto-saves diagram state every 1 second (debounced)
- Stores nodes, edges, and DSL representation
- Version-controlled storage format
- No manual save required

### 2. **Visual State Indicator**
- Floating indicator at top of screen when state exists
- Shows "Auto-saved X ago" with green pulse animation
- Displays node and connection counts
- Real-time updates

### 3. **State Management Actions**
- **Restore**: Revert to last saved state
- **Clear**: Remove saved state from storage
- **Info**: View detailed state information

### 4. **Smart Loading**
- Automatically loads persisted state on page refresh
- Only saves non-empty diagrams
- Validates version compatibility

## Architecture

### 1. Custom Hook: `useDiagramPersistence`

Location: `src/hooks/useDiagramPersistence.ts`

**Purpose**: Encapsulates all persistence logic in a reusable hook.

**API**:
```typescript
const {
  // State indicators
  hasPersistedState,    // boolean: Is there saved state?
  lastSaved,           // Date | null: When was it last saved?

  // Actions
  saveState,           // () => boolean: Manually save state
  loadPersistedState,  // () => PersistedState | null: Load saved state
  clearPersistedState, // () => boolean: Clear saved state

  // Utilities
  getStateMetadata,    // () => Metadata | null: Get state info
} = useDiagramPersistence({
  nodes,              // Current nodes
  edges,              // Current edges
  dsl,                // Current DSL
  autoSave: true,     // Enable auto-save?
  debounceMs: 1000,   // Auto-save delay (ms)
});
```

**Features**:
- Debounced auto-save (prevents excessive writes)
- Version validation
- Error handling
- Only saves when nodes exist (prevents empty state)

### 2. Visual Component: `PersistenceIndicator`

Location: `src/components/common/PersistenceIndicator.tsx`

**Purpose**: Provides visual feedback and user controls.

**Features**:
- Green pulsing indicator when state exists
- "Time ago" display (e.g., "2m ago", "just now")
- Expandable details panel showing:
  - Node count
  - Connection count
  - Last saved timestamp
- Action buttons:
  - Info (toggle details)
  - Restore (revert to saved state)
  - Clear (delete saved state)

### 3. Integration: `DiagramPage`

Location: `src/pages/DiagramPage.tsx`

**Changes**:
- Split into main component and content component
- Content component uses persistence hook
- Auto-loads state on mount
- Passes handlers to indicator component

## Storage Format

```typescript
{
  version: "1.0",           // Format version
  timestamp: "2025-...",    // ISO timestamp
  nodes: [...],             // React Flow nodes
  edges: [...],             // React Flow edges
  dsl: {...}                // Diagram DSL
}
```

**Storage Key**: `aws-diagram-state`

## User Flow

### First Time User
1. Opens app
2. No indicator shown (no saved state)
3. Adds nodes/connections
4. After 1 second, state auto-saves
5. Green indicator appears at top

### Returning User
1. Opens app
2. Persisted state loads automatically
3. Green indicator shows with "Auto-saved X ago"
4. Can click info to see details
5. Can restore last saved state
6. Can clear saved state

### Making Changes
1. User modifies diagram
2. After 1 second of inactivity, auto-saves
3. Indicator updates to show "just now"
4. Timestamp updates in details panel

### Clearing State
1. User clicks X button
2. Confirmation dialog appears
3. If confirmed, storage cleared
4. Indicator disappears
5. Current diagram remains (not cleared)

### Restoring State
1. User clicks restore button
2. Confirmation dialog appears
3. If confirmed, loads saved state
4. Current diagram replaced with saved version

## Benefits

### 1. **Pluggable Design**
- Self-contained hook
- Minimal changes to existing code
- Can be easily disabled or removed
- No tight coupling with diagram logic

### 2. **Non-Invasive**
- Doesn't modify existing diagram context
- Uses localStorage (no backend required)
- Optional auto-save
- User has full control

### 3. **User-Friendly**
- Automatic saving (no manual save button)
- Visual feedback (always know if saved)
- Easy restoration (undo mistakes)
- Clear state management (start fresh anytime)

### 4. **Robust**
- Version validation
- Error handling
- Debounced saves (performance)
- Empty state prevention

## Configuration

### Disable Auto-Save
```typescript
useDiagramPersistence({
  nodes,
  edges,
  dsl,
  autoSave: false,  // Disable auto-save
});
```

### Adjust Save Frequency
```typescript
useDiagramPersistence({
  nodes,
  edges,
  dsl,
  debounceMs: 3000,  // Save after 3 seconds
});
```

### Manual Save Only
```typescript
const { saveState } = useDiagramPersistence({
  nodes,
  edges,
  dsl,
  autoSave: false,
});

// Call saveState() manually when needed
<button onClick={saveState}>Save</button>
```

## Future Enhancements

1. **Multiple Save Slots**
   - Save different diagrams
   - Name saved states
   - Quick switch between diagrams

2. **Export/Import**
   - Download saved state as file
   - Import state from file
   - Share with others

3. **Cloud Sync**
   - Backend integration
   - Multi-device sync
   - User accounts

4. **History/Undo**
   - Multiple restore points
   - Timeline view
   - Selective restoration

5. **Auto-Recovery**
   - Browser crash detection
   - Unsaved changes warning
   - Recovery mode

## Testing

### Test Auto-Save
1. Add nodes to diagram
2. Wait 1+ seconds
3. Check localStorage: `aws-diagram-state`
4. Should contain saved state

### Test Load on Refresh
1. Create diagram with nodes
2. Wait for auto-save
3. Refresh page
4. Diagram should restore automatically

### Test Clear State
1. Create diagram
2. Click clear button in indicator
3. Confirm dialog
4. Indicator should disappear
5. Current diagram should remain

### Test Restore State
1. Create diagram
2. Wait for auto-save
3. Delete some nodes
4. Click restore button
5. Confirm dialog
6. Original diagram should restore

## Browser Compatibility

- Uses `localStorage` (supported in all modern browsers)
- Falls back gracefully if localStorage unavailable
- No external dependencies
- Works offline

## Storage Limits

- localStorage typically has 5-10MB limit per domain
- Current format is very efficient
- Can store large diagrams (100+ nodes)
- Consider IndexedDB for very large diagrams

## Privacy & Security

- All data stored locally (no server)
- User has full control
- Can clear anytime
- No tracking or analytics
- Data never leaves user's browser
