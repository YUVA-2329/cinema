# KATHA — COMPLETE REPOSITORY ANALYSIS

# 1. PROJECT OVERVIEW

**What Katha currently is:**
Katha is a story-sharing platform for Tollywood cinema where users can pitch movie concepts (stories), read pitches from others, and rate/vote on whether they "would watch" them as movies.

**Current Architecture:**
It is a Next.js (App Router) application. It primarily relies on `localStorage` and `sessionStorage` for immediate state persistence, while also syncing with a Next.js API route (writing to a local JSON file) and a Supabase backend for global persistence.

**Frontend Framework:** Next.js 14/15+ with React 19.
**Programming Languages:** TypeScript, HTML, CSS.
**Build System:** Next.js.
**Package Manager:** npm.
**Important Dependencies:** 
- `@supabase/ssr`, `@supabase/supabase-js` (Database & Auth)
- `tailwindcss`, `lucide-react` (UI)
- `framer-motion` (Animation)
- `canvas-confetti`, `html-to-image`

**Current Data/Storage Approach:**
A hybrid system. `src/lib/dataService.ts` writes directly to `localStorage` (e.g., `katha_real_stories_v3`) for immediate updates, then asynchronously pushes changes to `/api/stories` and Supabase.

**Backend/API/Auth Existence:**
- Backend: Yes, partially. There is a Next.js API route `/api/stories` and Supabase configured.
- Authentication: Yes, implemented via Context (`AuthContext`), storing profile data in `localStorage` and Supabase.

---

# 2. COMPLETE DIRECTORY STRUCTURE

```text
katha-main/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   │   └── stories/
│   │   ├── dashboard/
│   │   │   └── drafts/
│   │   ├── forgot-password/
│   │   ├── leaderboard/
│   │   ├── login/
│   │   ├── notifications/
│   │   ├── reset-password/
│   │   ├── search/
│   │   ├── signup/
│   │   ├── stories/
│   │   ├── story/
│   │   │   └── [slug]/
│   │   ├── u/
│   │   │   └── [username]/
│   │   └── write/
│   ├── components/
│   │   ├── AchievementBadge.tsx
│   │   ├── AuthModal.tsx
│   │   ├── CommentsSection.tsx
│   │   ├── FanCastingModule.tsx
│   │   ├── KathaLogo.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Navbar.tsx
│   │   ├── ReportModal.tsx
│   │   ├── ShareVerdictModal.tsx
│   │   ├── StoryCard.tsx
│   │   ├── StoryRatingModule.tsx
│   │   └── WouldWatchModule.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── dataService.ts
│   │   ├── sampleData.ts
│   │   └── supabase.ts
│   └── types/
│       └── index.ts
├── public/
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

# 3. EVERY PAGE / ROUTE

**Page: Home**
- Route: `/`
- File: `src/app/page.tsx`
- Purpose: Landing page showing Trending, Top this week (Leaderboard), New, and Hot stories.
- Data currently coming from: `getStories()` and `syncStoriesFromSupabase()` in `dataService.ts`.

**Page: Admin**
- Route: `/admin`
- File: `src/app/admin/page.tsx`
- Purpose: Admin dashboard for moderation.

**Page: Dashboard**
- Route: `/dashboard`
- File: `src/app/dashboard/page.tsx`
- Purpose: User profile dashboard for their published stories.

**Page: Drafts**
- Route: `/dashboard/drafts`
- File: `src/app/dashboard/drafts/page.tsx`
- Purpose: Manage unpublished stories.

**Page: Write Story**
- Route: `/write`
- File: `src/app/write/page.tsx`
- Purpose: Interface to write and publish a new story pitch.

**Page: Leaderboard**
- Route: `/leaderboard`
- File: `src/app/leaderboard/page.tsx`
- Purpose: Ranking of stories based on votes, views, and ratings.

**Page: Story Detail**
- Route: `/story/[slug]`
- File: `src/app/story/[slug]/page.tsx`
- Purpose: Read a full story, comment, rate, and cast votes.

**Page: User Profile**
- Route: `/u/[username]`
- File: `src/app/u/[username]/page.tsx`
- Purpose: Public view of an author's profile and their published stories.

**Page: Search**
- Route: `/search`
- File: `src/app/search/page.tsx`
- Purpose: Search interface for stories by title, pitch, or content.

**Page: Stories Explorer**
- Route: `/stories`
- File: `src/app/stories/page.tsx`
- Purpose: Feed of stories with sorting/filtering by genre.

**Pages: Auth**
- Routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`
- Files: `src/app/login/page.tsx`, etc.
- Purpose: User authentication flow.

**Page: Notifications**
- Route: `/notifications`
- File: `src/app/notifications/page.tsx`
- Purpose: View comments and likes on the user's stories.

---

# 4. EVERY COMPONENT

**Component: StoryCard**
- File: `src/components/StoryCard.tsx`
- Used by: Home, Stories, Dashboard.
- Purpose: Thumbnail preview of a story (title, author, genre, views, ratings).

**Component: AuthModal**
- File: `src/components/AuthModal.tsx`
- Purpose: Modal for quick login/signup.

**Component: CommentsSection**
- File: `src/components/CommentsSection.tsx`
- Purpose: Renders list of comments and an input field to add new ones.

**Component: FanCastingModule**
- File: `src/components/FanCastingModule.tsx`
- Purpose: Interface for users to vote for Hero/Director casting choices for a story.

**Component: StoryRatingModule**
- File: `src/components/StoryRatingModule.tsx`
- Purpose: Allows users to submit a 1-10 star rating.

**Component: WouldWatchModule**
- File: `src/components/WouldWatchModule.tsx`
- Purpose: Yes/No voting mechanism for "Would you watch this?".

**Component: ReportModal**
- File: `src/components/ReportModal.tsx`
- Purpose: UI to report a story or comment.

---

# 5. STORY CREATION FLOW

1. User navigates to `/write`.
2. Component `src/app/write/page.tsx` renders the editor.
3. Fields include: Title, Genre (select), One-Line Pitch, Story Body (content textarea), Cover Image URL, Casting Note, and a Mandatory Copyright Checkbox.
4. Text is stored in React `useState` hooks.
5. Upon clicking "PUBLISH STORY" or "SAVE DRAFT", `handleCreate` function executes.
6. The frontend validates word count (min 300, max 5000 words).
7. `createStory()` is called from `src/lib/dataService.ts`.
8. `createStory()` saves the data locally via `localStorage.setItem('katha_real_stories_v3', ...)`.
9. The function then sends a POST request to `/api/stories` and executes a Supabase `.insert()` into the `stories` table.
10. If successful, user is redirected to `/story/[slug]` (if published) or `/dashboard/drafts` (if draft).

---

# 6. STORY DATA MODEL

Defined in `src/types/index.ts`:

```typescript
Story
├── id: string (Required)
├── author_id: string (Required)
├── author: Profile (Required)
├── title: string (Required)
├── slug: string (Required)
├── genre: Genre (Required)
├── pitch: string (Required)
├── content: string (Required)
├── cover_image_url: string (Required)
├── views: number (Required)
├── likes_count: number (Required)
├── would_watch_yes: number (Required)
├── would_watch_no: number (Required)
├── average_rating: number (Required)
├── rating_count: number (Optional)
├── published: boolean (Required)
├── visibility: 'private' | 'public' (Optional)
├── casting_note: string (Optional)
├── is_featured: boolean (Optional)
├── created_at: string (Required)
├── updated_at: string (Optional)
├── hero_casting: Record<string, number> (Optional)
└── director_casting: Record<string, number> (Optional)
```
Fields are primarily persisted in `localStorage`, local JSON, and Supabase Database.

---

# 7. ALL USER INTERACTIONS

| UI Action | Component / Page | Current Behavior | Backend Needed |
| --- | --- | --- | --- |
| Publish Story | `write/page.tsx` | Saves locally, calls `/api/stories` & Supabase. | POST `/api/stories` |
| Like Story | `StoryCard` / `Story` | Toggles like in `localStorage`, syncs to Supabase. | POST `/api/stories/:id/like` |
| Vote "Would Watch" | `WouldWatchModule` | Saves vote to `localStorage`, syncs to Supabase. | POST `/api/stories/:id/vote` |
| Rate Story | `StoryRatingModule` | Calculates avg locally, syncs to Supabase. | POST `/api/stories/:id/rate` |
| Fan Casting Vote | `FanCastingModule` | Updates choices locally, syncs to Supabase. | POST `/api/stories/:id/cast` |
| Comment | `CommentsSection` | Saves to `localStorage`, syncs to Supabase. | POST `/api/stories/:id/comments` |
| Report | `ReportModal` | Generates report entity (likely in Supabase). | POST `/api/reports` |

---

# 8. MOCK / STATIC / HARDCODED DATA

- **File:** `src/lib/dataService.ts`
- **Location:** Throughout the file.
- **What it represents:** Uses `localStorage` arrays (`katha_real_stories_v3`, `katha_real_profiles_v3`, `katha_real_comments_v3`, etc.) as a mock relational database. It manually joins data and sorts it on the client side.
- **How UI uses it:** Fetches all data on mount to populate feeds and leaderboards immediately.
- **What real backend functionality would replace it:** Real database queries via Prisma/Drizzle on a Next.js server route, replacing `localStorage` fetching.

- **File:** `src/app/api/stories/route.ts`
- **What it represents:** It reads and writes to `.next/server_stories_v1.json` as a mock filesystem database to share state between sessions/users when Supabase isn't available.

---

# 9. EXISTING API / BACKEND

Yes, a backend exists.
1. **Next.js API:** `src/app/api/stories/route.ts`
   - **GET `/api/stories`:** Returns all stories (filters public/private).
   - **POST `/api/stories`:** Creates or updates a story.
   - Saves to `.next/server_stories_v1.json`.
2. **Supabase Integration:** Extensively used in `dataService.ts`. Queries tables `stories`, `profiles`, `comments`, `story_likes`, `story_ratings`, `would_watch_votes`, `casting_votes`.

---

# 10. AUTHENTICATION

Users can log in and sign up.
- Implemented via `@supabase/ssr`.
- Frontend state is maintained in `AuthContext`.
- Users have profiles (`Profile` type) with a username, display name, avatar, and score.
- No anonymous posting observed; `createStory` throws "Authentication required" if `getCurrentProfile()` returns null.

---

# 11. SEARCH

- **Search UI:** `/search` route.
- **Current Data Source:** Client-side filtering in `getStories(options)` inside `dataService.ts`.
- **Search Fields:** Title, pitch, genre, author display name, author username, content.
- **Filtering & Sorting:** Supported via `QueryOptions` in `dataService.ts`.
- **Backend Required:** Full-text search endpoint (e.g. `GET /api/search?q=...`).

---

# 12. LIKES / REACTIONS

- **Likes:** Handled by `toggleStoryLike` in `dataService.ts`. Saves to `localStorage` (`katha_real_likes_v3`), updates story count, and inserts into Supabase `story_likes` table.
- **Reactions (Would Watch):** Handled by `submitWouldWatchVote`. Saves to `localStorage`, updates story percentages, and inserts into Supabase `would_watch_votes`.
- **Ratings:** Handled by `submitStoryRating`. Saves to `localStorage`, recalculates average on client, inserts to Supabase `story_ratings`.

---

# 13. COMMENTS

- **Comment UI:** `CommentsSection.tsx`.
- **Data Structure:** `Comment` interface (id, story_id, author, parent_id, content).
- **Create:** `createComment` in `dataService.ts` saves to `localStorage` and Supabase `comments` table. 
- **Reply:** Supported via `parent_id`.

---

# 14. BOOKMARKS / SAVED STORIES

> No bookmark functionality found. (Checked `types/index.ts` and `dataService.ts` for bookmarks/saved lists).

---

# 15. PROFILE / AUTHOR SYSTEM

- Authors are represented as `Profile` objects (id, username, display_name, avatar_url, bio, katha_score).
- Users have full accounts and profiles.
- Profile pages exist at `/u/[username]`.
- Stories are associated with authors via `author_id` and the embedded `author` object.

---

# 16. ADMIN / MODERATION

- `/admin` page exists.
- `ReportModal.tsx` exists to flag content.
- The `Report` type handles reasons like copyright, plagiarism, offensive, etc.

---

# 17. MEDIA / FILE UPLOADS

- **Upload UI:** Only string inputs for URLs (e.g., `Cover Image URL` in `/write`).
- **File Handling:** The platform does NOT handle binary file uploads. It expects users to provide existing image URLs (like from Unsplash).

---

# 18. ENVIRONMENT VARIABLES

While the exact `.env` file couldn't be viewed, based on dependencies and `supabase.ts`, it likely uses:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

# 19. DATABASE / STORAGE

Storage relies heavily on:
1. Client `localStorage` and `sessionStorage`.
2. A server-side `.next/server_stories_v1.json` file.
3. Supabase PostgreSQL (tables: `stories`, `profiles`, `comments`, `story_likes`, `would_watch_votes`, `story_ratings`, `casting_votes`).

---

# 20. DEPENDENCIES

**UI:** `react`, `react-dom`, `tailwindcss`, `lucide-react`
**Animation:** `framer-motion`
**Routing:** `next` (App Router)
**Database / API / Authentication:** `@supabase/supabase-js`, `@supabase/ssr`
**Utilities:** `canvas-confetti`, `html-to-image`

All these dependencies are actively used based on `package.json` and imports in code.

---

# 21. STATE MANAGEMENT

- **React State:** Heavy use of `useState` inside components (`write/page.tsx`, `page.tsx`).
- **Context:** `AuthContext` for user session.
- **Client Storage:** `localStorage` is used as a primary state synchronization and caching layer across the app.

---

# 22. FRONTEND → BACKEND DATA FLOW

**Story Creation:**
USER -> `write/page.tsx` -> `createStory()` -> `localStorage` -> `fetch('/api/stories')` + `supabase.insert()` -> Redirect UI

**Likes:**
USER -> `StoryCard` (Heart Icon) -> `toggleStoryLike()` -> `localStorage` update -> `supabase.insert()` -> UI state changes instantly.

---

# 23. ROUTING MAP

| Route | Component/Page | Purpose | Backend Data |
| --- | --- | --- | --- |
| `/` | `HomePage` | Feeds & Leaderboards | `GET /api/stories` (Trending/New) |
| `/write` | `WriteStoryPage`| Create Story | `POST /api/stories` |
| `/story/[slug]` | `StoryPage` | View Story | `GET /api/stories/:slug` |
| `/dashboard` | `DashboardPage`| User Profile/Stats | `GET /api/stories?userId=...` |
| `/login` | `LoginPage` | Auth | Supabase Auth |
| `/search` | `SearchPage` | Search Feed | `GET /api/search` |

---

# 24. BACKEND REQUIREMENTS DISCOVERED

### REQUIRED
- **Stories CRUD API:** To replace `localStorage` usage completely.
- **Authentication:** Token validation on the backend to secure POST/PUT routes.
- **Relational Operations:** Endpoints to handle Likes, Ratings, "Would Watch" votes, and Fan Casting votes concurrently.
- **Comments API:** Fetch, Post, and Reply endpoints.

### OPTIONAL
- **Media Uploads:** An S3/Supabase Storage bucket integration for cover images instead of relying on external URLs.

### NOT PRESENT
- Bookmarks / Saved Stories.

---

# 25. API CONTRACT PROPOSAL

```text
GET /api/stories
- Needed for: Feeds, Leaderboards, Search.
- Request: Query params for sort, genre, visibility.
- Response: Array of Story objects.

GET /api/stories/:id
- Needed for: Story Detail page.
- Response: Story object with Profile populated.

POST /api/stories
- Needed for: Publishing / Saving drafts.
- Request: Story payload.

POST /api/stories/:id/like
- Needed for: Toggling likes.

POST /api/stories/:id/vote
- Needed for: Would Watch voting.
- Request: { vote: 'yes' | 'no' }

POST /api/stories/:id/rate
- Needed for: Star ratings.
- Request: { rating: number }

POST /api/stories/:id/comments
- Needed for: Adding comments.
- Request: { content: string, parent_id?: string }
```

---

# 26. DATABASE REQUIREMENTS

**Required by existing application:**
- `User` / `Profile`: Handles authors and voters.
- `Story`: The main content entity.
- `Comment`: Associated with a story and author.
- `StoryLike`: Mapping table for user likes on stories.
- `StoryRating`: Mapping table for user 1-10 ratings.
- `WouldWatchVote`: Mapping table for yes/no votes.
- `CastingVote`: Mapping table for fan casting.

---

# 27. SECURITY REQUIREMENTS

- **User-Generated Content:** The story content requires sanitation against XSS if rendered via HTML. Currently, the word count validator exists on the frontend, but must be duplicated on the backend.
- **Visibility Checks:** The API must strictly enforce `visibility: 'private'` rules so unpublished stories cannot be accessed via direct URL by non-authors.
- **Authorization:** Only the author should be able to edit/delete their story. Users shouldn't be able to vote or rate their own stories (this is checked in frontend `dataService.ts` but needs backend enforcement).

---

# 28. BUILD & RUN INSTRUCTIONS

Found in `package.json`:
```bash
npm install
npm run dev
```

---

# 29. IMPORTANT FILES

```text
Critical files
├── src/lib/dataService.ts - Contains ALL data fetching, mocking, and business logic connecting the UI to Supabase and API routes.
├── src/types/index.ts - Contains the entire data schema/contract expected by the frontend.
├── src/app/write/page.tsx - The complex core flow for creating content.
└── src/app/api/stories/route.ts - The existing mock Next.js server route that must be replaced/expanded.
```

---

# 30. FINAL EXECUTIVE SUMMARY

## What Katha already has
A fully functional React frontend with extensive client-side logic for rendering feeds, leaderboards, voting mechanisms, and auth modals. It features a hybrid database approach using Supabase and `localStorage`.

## What Katha is missing
A dedicated, robust API layer. Currently, business logic (like preventing a user from rating their own story, or calculating trending scores) lives entirely in the client-side `dataService.ts`.

## What the backend MUST implement
The backend must port all logic from `src/lib/dataService.ts` to secure API routes. It needs to handle relational mapping (Likes, Ratings, Casting) securely so users can't tamper with vote counts on the client.

## What should NOT be changed
The frontend components and `types/index.ts`. The UI is complete and styled.

## Most important frontend files to connect
`src/lib/dataService.ts` is the central nervous system. Refactoring this file to fetch from a real backend instead of `localStorage` will instantly connect the entire application.

## Biggest technical risks
The current architecture trusts the client heavily. A malicious user could theoretically bypass the `localStorage` checks to rate their own story or manipulate the `katha_score`.

## Recommended backend architecture
Since the project uses Next.js and Supabase, the best path forward is to migrate the Supabase client logic out of the frontend and into Next.js Server Actions or API routes, leveraging Supabase Row Level Security (RLS) to enforce data integrity.
