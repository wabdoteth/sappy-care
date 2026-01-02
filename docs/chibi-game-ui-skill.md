---
name: chibi-game-ui-react-native
description: >-
  Design, build, and polish a React Native frontend in a chibi, toy-like "video game UI" style
  (cozy pastel scenes plus arcade reward moments). Use when Codex must define UI tokens/theme,
  implement reusable components (cards, mission rows, HUD chips, progress bars, bottom nav),
  add motion/animations (Reanimated, gestures, Lottie) and haptics, create popups/modals/bottom
  sheets/toasts, integrate consistent icons/mascots/illustrations, and replicate chibi home,
  mission, shop, and arcade HUD screen patterns.
---

# Chibi Game UI for React Native

## Execute the workflow

1. Select the closest screen pattern: `HomeScene`, `MissionList`, `ShopSheet`, `ArcadeHUD`, `QuestList`, `FriendsList`, `Settings`.
2. Update tokens first (spacing/radius/type/colors/shadows/motion). Avoid "magic numbers" in screens.
3. Build or reuse primitives (Card/Button/Row/Modal/BottomNav) before composing screens.
4. Add micro-interactions everywhere; add **one** "reward moment" per meaningful success action.
5. Run a polish pass: spacing, hierarchy, tap targets, safe areas, reduce-motion, 60fps, empty/loading/error.

## Replicate the visual DNA

### Cozy chibi baseline
- Pastel background fields (mint/sky/cream) with very soft gradients.
- Large rounded surfaces (pill/squircle), gentle shadows, faint borders.
- Scene header with props (window/door/lamp/nest) and a mascot centered/anchored.
- Friendly typography (rounded), generous whitespace, big primary CTA.

### Arcade "juice" (use only for reward moments)
- Vibrant gradient overlays (pink/orange/purple), sparkles, confetti, floating +points.
- Big outlined/embossed numerals for combo/XP/earn.
- Stronger pop/bounce + haptics on success only.

Rule: Keep normal screens calm and readable; make reward feedback flashy.

## Define tokens as the source of truth

Create `src/ui/tokens.ts` and route all sizing/color/motion through it.

Use these defaults:
- Spacing scale: 4, 8, 12, 16, 20, 24, 32
- Radii: 12, 16, 20, 28 (default card: 20–28)
- Tap size: >= 44x44; provide `hitSlop`
- Shadows: `soft` (baseline), `punchy` (rewards)
- Motion presets: `cozySpring`, `popSpring`, durations

Example:
```ts
export const tokens = {
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, x2: 32 },
  radius: { sm: 12, md: 16, lg: 20, xl: 28 },
  type: {
    title: { size: 22, weight: "800" },
    body:  { size: 16, weight: "600" },
    meta:  { size: 13, weight: "600" },
    number:{ size: 28, weight: "900" },
  },
  shadow: {
    soft:   { y: 6, blur: 14, opacity: 0.12 },
    punchy: { y: 8, blur: 18, opacity: 0.18 },
  },
  motion: {
    cozy: { damping: 14, stiffness: 180, mass: 1 },
    pop:  { damping: 12, stiffness: 240, mass: 0.85 },
    dur:  { micro: 160, modal: 360 },
  },
};
```

## Build the primitives (do this before screens)

### Foundation primitives
- `Screen`: SafeArea + background + optional ScrollView.
- `Card`: rounded surface, soft shadow, optional faint outline.
- `Row` / `Stack`: gap-based layout wrappers.
- `Inset`: standardized padding wrapper.

### Game UI primitives
- `PressablePop`: press squish + spring return (use everywhere).
- `BigCTAButton`: pill button with elevation, icon optional, press squish.
- `IconBadge`: round/squircle badge for an icon.
- `HUDChip`: icon + number chip (currency/energy/level).
- `XPBar`: rounded progress bar with highlight sheen.
- `MissionRow`: reward badge + title + optional progress + right action (GO/check).
- `BottomNav`: toy icons + labels, 5–6 tabs, selected state.

### Overlay primitives
- `ModalCard`: centered modal (scale+fade spring).
- `BottomSheet`: "shop" sheet; 1–2 snap points max.
- `Toast`: minimal status toast.
- `RewardToast`: sparkle burst + count-up number.
- `ConfirmDialog`: mascot + primary + secondary.

## Implement motion with strict rules

Prefer:
- `react-native-reanimated` for UI-thread animation
- `react-native-gesture-handler` for drag/swipe
- `lottie-react-native` for sparkles/confetti/celebrate
- Optional `@shopify/react-native-skia` for particles/glows (only if needed)

Apply these rules:
- Use transforms (scale/translate/opacity); avoid layout thrash.
- Keep micro motion 120–240ms; modal 280–500ms.
- Use `cozy` spring for baseline; use `pop` spring for rewards.
- Allow Reduce Motion mode (disable particles, reduce bounce).

Press squish:
```tsx
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export function PressablePop({ children, onPress }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
      onPressIn={() => (s.value = withSpring(0.96, { damping: 14, stiffness: 220 }))}
      onPressOut={() => (s.value = withSpring(1, { damping: 12, stiffness: 180 }))}
      onPress={onPress}
      hitSlop={8}
    >
      <Animated.View style={a}>{children}</Animated.View>
    </Pressable>
  );
}
```

Success "reward moment" recipe (use once per action):
- Pop animation (scale 0.92 -> 1.06 -> 1).
- Haptic success.
- Count-up (number tween).
- One sparkle/confetti Lottie burst.

Error recipe:
- Subtle wobble (rotate/translate), soft tint, short haptic.

## Compose screens using these patterns

### HomeScene (cozy room + goals)
- Keep a static scene header (background + props + mascot) above the scroll region if possible.
- Place one primary CTA (big pill) beneath the mascot.
- Render goals as pill cards:
  - Left: `IconBadge`
  - Middle: title (bold) + optional subtitle
  - Right: reward indicator (energy/star) + big check button
- Use a fixed BottomNav.

### MissionList (daily/weekly/list with progress)
- Use a panel header: title + close button (top-right).
- Split sections: `Daily`, `Weekly`, `Mission List`.
- Row layout:
  - Left: star reward badge + amount
  - Middle: title + optional progress bar (thin, rounded)
  - Right: action (GO button or checkmark tile)
- Keep row height consistent; keep actions large and tappable.

### ShopSheet (bottom sheet with categories)
- Dim background; keep the sheet bright and playful.
- Put a centered shop icon/illustration at top of sheet.
- Use a "name plate" title chip (toy label).
- Use 2-column big cards (Outfit/Furniture/Color/Travel).
- Animate sheet in with cozy spring; selected tab in BottomNav should highlight.

### ArcadeHUD (tap-game overlay)
- Top-left: level badge.
- Top: XP bar spanning width.
- Center: combo label + big number.
- Add floating +points text near tap origin.
- Use vivid gradient background and sparkle bursts on combos; keep baseline readable.

## Iconography and mascot constraints

- Use rounded, thick shapes; minimal detail; consistent stroke/outline feel.
- Standardize icon sizes: 16/20/24/28/32 and map via a single `AppIcon` wrapper.
- Prefer SVG for UI icons; use raster only for mascots/background props.
- Keep mascot faces simple (dot eyes, tiny mouth/beak, blush).
- Convey progress with accessories (hat/badge/cape), not more detail.

## Typography and numbers

- Use a rounded font family if available; avoid thin weights.
- Use heavier weights for numbers (XP/combo/rewards).
- Treat game numbers as UI elements: bigger, bolder, animated on change.

## Accessibility and responsiveness

- Enforce tap targets >= 44x44 (use `hitSlop`).
- Add `accessibilityLabel` to icon-only buttons.
- Preserve contrast on pastel/gradient surfaces.
- Support small screens: keep the scene header compact; avoid truncation for key actions.
- Provide a Reduce Motion flag and respect system settings where possible.

## Performance guardrails

- Keep animation on UI thread (Reanimated).
- Reduce heavy shadows in long lists; prefer subtle borders and light shadows.
- Use `FlatList` for mission/task lists; memoize rows; keep props stable.
- Reuse Lottie instances; limit simultaneous effects.

## Deliverables per feature

- Screen component composed from primitives and tokens.
- Any new primitives added to `src/ui/components/` with a small usage example.
- Motion notes: which interactions animate, which preset, and which reward moment triggers.
- QA notes: safe area, a11y, reduce-motion, performance, and all states.

## Acceptance checklist

- ✅ Use tokens (no screen-level ad-hoc spacing/radius).
- ✅ Make presses squishy and consistent.
- ✅ Trigger exactly one reward moment per success.
- ✅ Keep modals/sheets cute, focused, and readable.
- ✅ Keep icons and mascot style consistent across screens.
- ✅ Handle empty/loading/error and safe areas.
- ✅ Maintain smooth scrolling and 60fps interactions.

## Suggested structure

```txt
src/
  ui/
    tokens.ts
    theme.ts
    components/
      Screen.tsx
      Card.tsx
      PressablePop.tsx
      BigCTAButton.tsx
      IconBadge.tsx
      HUDChip.tsx
      XPBar.tsx
      MissionRow.tsx
      ModalCard.tsx
      BottomSheet.tsx
      BottomNav.tsx
      Toast.tsx
  features/
    home/
    missions/
    shop/
    arcade/
    friends/
  assets/
    icons/
    mascots/
    lottie/
```
