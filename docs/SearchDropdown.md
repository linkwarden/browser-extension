# SearchDropdown Component

The `SearchDropdown` component is a reusable, generic dropdown component with search functionality that supports both collections and tags in the Linkwarden browser extension.

## Features

- **Generic Design**: Works with both collections and tags
- **Search Functionality**: Real-time filtering with magnifying glass icon
- **Creation Support**: Create new items directly from the search interface
- **Multi-select Support**: Supports both single-select (collections) and multi-select (tags) modes
- **Keyboard Navigation**: Enter to create, Escape to close
- **Accessible**: Built with proper ARIA attributes and keyboard support
- **Theme Aware**: Supports light/dark theme modes

## Usage

### Basic Collection Dropdown

```tsx
import { SearchDropdown } from './SearchDropdown.tsx';

<SearchDropdown
  value={selectedCollection}
  onChange={(collection) => handleCollectionChange(collection)}
  items={collections}
  loading={loadingCollections}
  onRefetch={refetchCollections}
  placeholder="Select a collection..."
  type="collection"
  multiple={false}
/>
```

### Multi-select Tags Dropdown

```tsx
<SearchDropdown
  value={selectedTags}
  onChange={(tags) => handleTagsChange(tags)}
  items={tags}
  loading={loadingTags}
  onRefetch={refetchTags}
  placeholder="Select tags..."
  type="tags"
  multiple={true}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `SearchItem \| SearchItem[] \| undefined` | Yes | Current selected value(s) |
| `onChange` | `(item: SearchItem \| SearchItem[]) => void` | Yes | Callback when selection changes |
| `items` | `SearchItem[] \| undefined` | Yes | Available items to display |
| `loading` | `boolean` | Yes | Loading state indicator |
| `onRefetch` | `() => void` | Yes | Function to refetch items after creation |
| `placeholder` | `string` | No | Placeholder text (default: "Search or select...") |
| `type` | `'collection' \| 'tags'` | Yes | Type of items for API calls |
| `multiple` | `boolean` | No | Enable multi-select mode (default: false) |
| `displayKey` | `string` | No | Key to use for displaying items (default: 'name') |
| `searchKey` | `string` | No | Key to use for searching (default: 'name') |

## SearchItem Interface

```tsx
interface SearchItem {
  id: number;
  name: string;
  ownerId?: number;
  pathname?: string; // For collections
}
```

## Behavior

### Single Select Mode (Collections)
- Clicking an item selects it and closes the dropdown
- Only one item can be selected at a time
- Display shows the selected item name

### Multi Select Mode (Tags)
- Clicking an item toggles its selection state
- Multiple items can be selected
- Display shows comma-separated list of selected items
- Checkmarks indicate selected items

### Search and Creation
- Type in the search field to filter items
- If search query doesn't match any existing items, a "Create" option appears
- Press Enter or click the create option to create a new item
- New items are automatically added to the API and local state

### Keyboard Navigation
- **Enter**: Create new item (when create option is available)
- **Escape**: Close dropdown and clear search

## Styling

The component uses Tailwind CSS classes and follows the application's design system:

- Light/dark theme support
- Consistent spacing and typography
- Hover and focus states
- Loading states
- Accessible color contrast

## Integration Example

```tsx
// In BookmarkForm.tsx
const {
  isLoading: loadingCollections,
  data: collections,
  refetch: refetchCollections,
} = useQuery({
  queryKey: ['collections'],
  queryFn: fetchCollections,
});

<FormField
  control={control}
  name="collection"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Collection</FormLabel>
      <FormControl>
        <SearchDropdown
          value={field.value}
          onChange={(collection) => field.onChange(collection)}
          items={collections}
          loading={loadingCollections}
          onRefetch={refetchCollections}
          placeholder="Select a collection..."
          type="collection"
          multiple={false}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## API Integration

The component automatically handles API calls for creating new items:

- **Collections**: Uses `createCollection()` from `actions/collections.ts`
- **Tags**: Uses `createTag()` from `actions/tags.ts`

Both functions require:
- `baseUrl`: Linkwarden API base URL
- `apiKey`: User's API authentication key
- Item data with `name` property

## Error Handling

- Network errors are displayed via toast notifications
- Loading states prevent multiple simultaneous requests
- Failed creations don't affect existing selections
- Graceful fallback for missing or invalid data