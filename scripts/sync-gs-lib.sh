#!/bin/bash
# Pulls a fresh golfstatus_react_components release into src/gs-lib, keeping
# gs-lib as an editable fork rather than a locked dependency: the release is
# still the source of truth for anything shared, but local-only additions
# (gs-checkbox, usePanelList.js, colorScale.js, theme.scss, ...) survive
# untouched, and nothing here gets published anywhere — it's a straight
# file copy.
#
# Usage:
#   scripts/sync-gs-lib.sh /path/to/extracted/golfstatus-react-components-X.Y.Z
#
# The argument is a checkout/extract of the release with a `src/` folder at
# its root (i.e. what you'd get from `git clone` or unzipping a release
# tarball of https://github.com/GolfStatus/golfstatus-react-components).
#
# What this does, matching the manual merge done on 2026-09-16:
#   - Overwrites any gs-lib file that also exists in the release (release
#     wins for anything shared).
#   - Adds any file the release has that gs-lib doesn't yet.
#   - Never deletes or touches a gs-lib file the release doesn't have —
#     that's how local-only additions survive a sync.
#   - Special-cases helpers/ScorecardHelper: the release ships it as
#     ScorecardHelper.js, but gs-lib keeps it as ScorecardHelper.jsx (one
#     gs-lib file imports it with an explicit .jsx extension) — content
#     syncs, filename doesn't.
#   - Refreshes gs-lib/index.js (the barrel "GolfStatus Event Website"
#     resolves golfstatus_react_components to via craco.config.js) and
#     appends the explicit .js/.jsx extensions raw ESM resolution needs
#     outside of a bundler's own src/ tree — the release's own index.js
#     omits them, since its build step (microbundle-crl) resolves
#     extensions itself.
#
# What it deliberately leaves out, because gs-lib never mirrored them and
# they're package-publishing/tooling artifacts, not component source:
# stories/, index.test.js, package.json, package-lock.json, README.md,
# release.sh, example/, build-storybook.log.

set -euo pipefail

RELEASE_DIR="${1:?Usage: scripts/sync-gs-lib.sh /path/to/extracted/golfstatus-react-components-release}"
RELEASE_SRC="$RELEASE_DIR/src"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GS_LIB="$SCRIPT_DIR/../src/gs-lib"

if [ ! -d "$RELEASE_SRC" ]; then
  echo "error: $RELEASE_SRC not found — pass the release's root (the folder containing src/), not src/ itself." >&2
  exit 1
fi

echo "Syncing gs-lib from $RELEASE_SRC ..."

# Component/helper/hook/style/image source — rsync without --delete copies
# new + overwrites shared, but never removes a gs-lib-only file.
for dir in components helpers hooks styles images; do
  if [ -d "$RELEASE_SRC/$dir" ]; then
    mkdir -p "$GS_LIB/$dir"
    rsync -a --exclude 'ScorecardHelper.js' "$RELEASE_SRC/$dir/" "$GS_LIB/$dir/"
  fi
done

# Root-level source files that aren't under one of the dirs above.
for f in .eslintrc styles.module.css index.js; do
  if [ -f "$RELEASE_SRC/$f" ]; then
    cp "$RELEASE_SRC/$f" "$GS_LIB/$f"
  fi
done

# ScorecardHelper: sync content, keep gs-lib's .jsx filename.
if [ -f "$RELEASE_SRC/helpers/ScorecardHelper.js" ]; then
  cp "$RELEASE_SRC/helpers/ScorecardHelper.js" "$GS_LIB/helpers/ScorecardHelper.jsx"
fi

# Two import-path bugs baked into the release itself (not gs-lib drift —
# they reproduce from a clean checkout of the release too), found breaking
# `npm run build` on 2026-09-16. Fixed here so every sync doesn't re-break
# the same way:
#   - gs-image.scss's @import assumes the library's own src/components/ →
#     src/styles/ nesting (one level shallower than gs-lib's
#     src/gs-lib/components/ → src/gs-lib/styles/).
#   - gs-text-editor.jsx imports GSInput/HTMLViewer from the package's own
#     barrel (index.js) and a Storybook file — neither exists when gs-lib is
#     consumed as raw source rather than a built package.
if [ -f "$GS_LIB/components/gs-image.scss" ]; then
  sed -i '' "s#@import '../../src/styles/golfstatus.scss';#@import '../styles/golfstatus.scss';#" "$GS_LIB/components/gs-image.scss"
fi
if [ -f "$GS_LIB/components/gs-text-editor.jsx" ]; then
  sed -i '' \
    -e 's#import { GSInput } from "\.\.";#import GSInput from "./gs-input";#' \
    -e 's#import { HTMLViewer } from "\.\./stories/controls/gs-html-viewer\.stories";#import HTMLViewer from "./gs-html-viewer";#' \
    "$GS_LIB/components/gs-text-editor.jsx"
fi

# gs-lib/index.js needs every relative import fully-specified (see
# craco.config.js in "GolfStatus Event Website" for why) — the release's
# own copy omits extensions, so add them back the same way the 2026-09-16
# merge did.
if [ -f "$GS_LIB/index.js" ]; then
  sed -i '' -E 's#(from "\./(components|hooks)/[a-zA-Z0-9_/-]+)";#\1.jsx";#' "$GS_LIB/index.js"
  sed -i '' -E 's#(from "\./helpers/[a-zA-Z0-9_/-]+)";#\1.js";#' "$GS_LIB/index.js"
  sed -i '' -E 's#(from "\./helpers/ScorecardHelper)\.js";#\1.jsx";#' "$GS_LIB/index.js"
fi

echo ""
echo "Done. Files changed in gs-lib:"
git -C "$SCRIPT_DIR/.." status --porcelain -- src/gs-lib

cat <<'EOF'

Before committing:
  1. Run `npm run build` — if it fails on a missing Sass variable (like the
     $cyan-100/300/500/600/900 removal on 2026-09-16), the release likely
     trimmed a color step something in the app still uses. Check
     `git diff -- src/gs-lib/styles/colors.scss` and either add the missing
     shade back or update the call sites — see that date's fix for the
     pattern.
  2. If the release added a new component, add it to gs-lib/index.js's
     import/export lists by hand (this script only re-extensions existing
     lines, it doesn't add new ones) — then also add it to
     "GolfStatus Event Website"'s craco.config.js if it needs the same
     fully-specified-import treatment (it shouldn't, since the include/alias
     there cover all of gs-lib, not per-file).
  3. Spot check any gs-lib file this script touched that had a
     cross-reference into deleted/renamed release files (rare, but the
     ModuleScopePlugin/fullySpecified errors from 2026-09-16 are the shape
     of what breaks if so).
EOF
