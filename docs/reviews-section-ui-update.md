# Guest reviews UI update (layout and responsiveness)

## What we changed

### 1. Controller: rating breakdown for the summary panel
**File:** `controllers/listings.js` — in `showListing`

- After loading the listing and reviews, we run a second MongoDB `aggregate` that groups reviews by `rating` (1–5).
- We build `ratingBreakdown`: an array of `{ stars, count, percent }` for each star level (5 down to 1), where `percent` is the share of all reviews for that listing.
- We pass `ratingBreakdown` to the view along with existing fields (`averageRating`, `totalReviews`, `visibleReviews`, `hasOlderReviews`, `hasNewerReviews`).

### 2. View: structured reviews section (not a single column “queue”)
**File:** `views/listings/show.ejs`

- **Header:** “Guest reviews” with subtitle (average or “New” · review count).
- **Overview panel** (only when there are reviews): large score, star row via existing `starability-result`, and a **distribution list** (5★ → 1★) with horizontal bars and counts.
- **Review list:** each review is an `<article class="review-card">` with an inner card wrapper, header row (avatar + name + date, stars on the right), body text, and delete form for the author.
- **Pagination:** links for “Newer” / “Older” when `hasNewerReviews` / `hasOlderReviews` are true, using `?reviewsPage=#` and `#reviews` anchor (this matches the existing controller pagination).

### 3. Styles: cards, summary, grid, mobile-friendly touch targets
**File:** `public/css/listings/show.css`

- **`.reviews-overview`:** soft background, border, rounded panel; from `720px` up, **two columns** (score block + breakdown) so desktop uses width instead of a thin stack.
- **`.reviews-grid`:** responsive CSS grid — `minmax(min(100%, 300px), 1fr)` so **one column on narrow phones**, then **two columns from `900px`** when the main listing layout is wide enough.
- **`.review-card-inner`:** bordered card, light shadow, hover polish where hover is available.
- **Breakdown rows:** grid with star label, bar, count; tighter typography on very small widths (`max-width: 400px`).
- **Tap targets:** pagination links and delete button use at least ~44px min-height for easier mobile use.
- **Long comments:** `overflow-wrap` / `word-break` so text does not overflow the card.

## Responsive behavior (summary)

| Viewport | Behavior |
|----------|----------|
| Narrow phone | Single-column review cards; overview stacks (score above bars); full-width grid cells via `min(100%, 300px)`. |
| ≥ 720px | Overview becomes two columns (score + distribution). |
| ≥ 900px (within main column) | Review cards use a **2-column** grid. |
| Listing page ≥ 900px | Existing `.listing-body` already stacks to one column; sidebar moves below main so reviews still read in one main column — layout stays consistent. |

## Files touched for this feature

- `controllers/listings.js`
- `views/listings/show.ejs`
- `public/css/listings/show.css`
- This doc: `docs/reviews-section-ui-update.md`

---

## Elegance pass (visual refinement)

Follow-up polish so the block feels editorial and high-end rather than default UI:

- **`listing-reviews--polished`** wrapper in `show.ejs` with scoped CSS variables for ink, muted text, surfaces, and subtle inner highlight.
- **Eyebrow line** (“What guests are saying”) above the section title for hierarchy.
- **Summary panel:** larger `--radius-xl`, layered gradient surface, soft border, `shadow-sm` + inset highlight; score uses a **serif** numeral for the big rating.
- **Distribution bars:** teal gradient (aligned with `--accent`) instead of flat black bars; slightly smoother width transition.
- **Review cards:** left gradient accent strip, softer shadows, header/footer **divider**, star row in a **muted pill**, optional **large quote** glyph on body text, refined avatar gradient + shadow.
- **Pagination:** pill buttons with border/shadow instead of bare underlined links.
- **“Leave a review”:** top separator and tighter typography on the heading.
