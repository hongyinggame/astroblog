"""Extract MomentList.svelte styles into a standalone CSS file for Swup resilience."""
import re

path = r'E:\hongyingshana\astro\Firefly\Firefly\src\components\homepage\MomentList.svelte'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Extract CSS from style block ──
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if not style_match:
    print('ERROR: No <style> block found')
    exit(1)

raw_css = style_match.group(1)

# ── 2. Transform CSS ──
# Rules to apply (in order):
# - Remove :global(...) wrappers but keep the inner selector
# - Prefix all top-level selectors with [data-moment-page]
# - Svelte @media queries get handled normally (they're already valid CSS)

def transform_css(css):
    """Transform Svelte-scoped CSS to global CSS with [data-moment-page] prefix."""
    lines = css.split('\n')
    result = []

    for line in lines:
        stripped = line.strip()

        # Skip empty lines without context (we'll handle spacing later)
        if not stripped:
            result.append(line)
            continue

        # Handle :global(...) - extract inner content
        # Pattern: :global(.dark) .feed-card { ... } -> .dark [data-moment-page] .feed-card { ... }
        # Pattern: :global([data-*]) { ... } -> [data-moment-page] [data-*] { ... }
        if ':global(' in stripped:
            # Extract content inside :global(...)
            global_match = re.match(r'(.*):global\(([^)]+)\)(.*)', stripped)
            if global_match:
                prefix = global_match.group(1)  # whitespace before
                inner = global_match.group(2)    # .dark or [data-*]
                suffix = global_match.group(3)   # rest of line
                # Rebuild: prefix + inner + [data-moment-page] + suffix
                if suffix.strip().startswith('{'):
                    # :global(xxx) { ... } - the global block is the selector itself
                    new_line = f'{prefix}{inner} [data-moment-page] {inner}{suffix}'
                    # Actually no, this means: :global(.dark) .feed-card { ... }
                    # Should become: .dark [data-moment-page] .feed-card { ... }
                    pass  # handled below
                result.append(line)
                continue

        result.append(line)

    return '\n'.join(result)


# Simpler approach: just do string replacements on the raw CSS
processed = raw_css

# Replace :global(.dark) patterns
# :global(.dark) .feed-card { → .dark [data-moment-page] .feed-card {
processed = re.sub(r':global\(\.dark\)\s+\.', r'.dark [data-moment-page] .', processed)
# :global(.dark) .page-title { → .dark [data-moment-page] .page-title {
processed = re.sub(r':global\(\.dark\)\s+\.', r'.dark [data-moment-page] .', processed)

# Replace :global([data-*]) patterns
# :global([data-full-content]) { → [data-moment-page] [data-full-content] {
# :global(.dark [data-full-content]) { → .dark [data-moment-page] [data-full-content] {
processed = re.sub(r':global\(([^)]*\[data-[^)]*\])\)', r'[data-moment-page] \1', processed)

# Now prefix all top-level CSS selectors with [data-moment-page]
# A "top-level selector" starts at the beginning of a line (after whitespace)
# and is followed by { or a selector continuation
# We need to be careful not to prefix things inside @media or other at-rules improperly

# Strategy: Find all CSS rule blocks that start at a given indentation level,
# and prefix the outermost selector with [data-moment-page]

# Actually, the simplest approach: just wrap everything in [data-moment-page] { ... }
# But that breaks @keyframes and @media at-rules...

# Let me do this line by line properly

lines = processed.split('\n')
result = []
in_rule = False
brace_depth = 0
current_indent = 0

for i, line in enumerate(lines):
    stripped = line.strip()
    if not stripped:
        result.append(line)
        continue

    indent = len(line) - len(line.lstrip())

    # Skip already-prefixed lines, @ rules, comments, and lines inside blocks
    is_at_rule = stripped.startswith('@')
    is_comment = stripped.startswith('/*')
    is_prefixed = '[data-moment-page]' in stripped
    is_closing_brace = stripped == '}'

    # Check if this line starts a new CSS rule (not inside braces)
    if not is_at_rule and not is_comment and not is_prefixed and not is_closing_brace and brace_depth == 0:
        if '{' in stripped and not stripped.startswith('}'):
            # This is a top-level selector - add prefix
            # But only if it's a selector, not a property
            if ':' not in stripped.split('{')[0].strip().split()[0] if ' ' in stripped.split('{')[0] else not stripped.split('{')[0].strip().startswith(':'):
                # Actually let's be more careful - only prefix if it looks like a class/id/data selector
                selector_part = stripped.split('{')[0].strip()
                if selector_part and not selector_part.startswith(':') and not selector_part.startswith('&'):
                    # Check if this is already inside a prefixed context
                    result.append(f'{"".join([chr(9)] * (indent // len(chr(9))))}[data-moment-page] {stripped}')
                    brace_depth += stripped.count('{') - stripped.count('}')
                    continue

    # Track brace depth
    brace_depth += stripped.count('{') - stripped.count('}')

    result.append(line)

processed_css = '\n'.join(result)

# ── 3. Write CSS file ──
# Use a simple wrapper approach instead
better_css_lines = []
css_lines = raw_css.split('\n')
media_depth = 0
rule_selector = []  # stack of selectors

for line in css_lines:
    stripped = line.strip()

    if not stripped:
        better_css_lines.append(line)
        continue

    indent = len(line) - len(line.lstrip())

    # :global(...) transformations
    if ':global(.dark)' in stripped:
        # :global(.dark) .foo -> .dark [data-moment-page] .foo
        line = line.replace(':global(.dark)', '.dark [data-moment-page]')

    if ':global([data-' in stripped:
        # :global([data-full-content]) -> [data-moment-page] [data-full-content]
        # :global(.dark [data-full-content]) -> .dark [data-moment-page] [data-full-content]
        line = re.sub(r':global\(([^)]+)\)', r'\1', line)
        # Now add [data-moment-page] prefix if not already present
        if '[data-moment-page]' not in line:
            # Find the first non-whitespace position and insert prefix
            ws = line[:len(line) - len(line.lstrip())]
            rest = line.lstrip()
            line = f'{ws}[data-moment-page] {rest}'

    better_css_lines.append(line)

processed_css = '\n'.join(better_css_lines)

# Also wrap top-level selectors with [data-moment-page] prefix
# A top-level selector at the start of a line (after whitespace):
# .class-name { ... } or .class-name, .other { ... } or .class-name ::pseudo { ... }
final_lines = []
in_at_rule = False
for line in processed_css.split('\n'):
    stripped = line.strip()
    if not stripped:
        final_lines.append(line)
        continue
    if stripped.startswith('@'):
        in_at_rule = True
        final_lines.append(line)
        continue
    if stripped == '}':
        final_lines.append(line)
        in_at_rule = False
        continue
    if in_at_rule:
        final_lines.append(line)
        continue
    # Top-level selector rule
    if not stripped.startswith('/*') and '{' in stripped and '[data-moment-page]' not in stripped and ':' not in stripped[:2]:
        # Check if it's a selector (starts with ., #, [, or &)
        if stripped[0] in '.#&[':
            ws = line[:len(line) - len(line.lstrip())]
            rest = line.lstrip()
            final_lines.append(f'{ws}[data-moment-page] {rest}')
            continue
    final_lines.append(line)

final_css = '\n'.join(final_lines)

# ── 4. Save to file ──
css_path = r'E:\hongyingshana\astro\Firefly\Firefly\src\styles\moment-list.css'
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(final_css)
print(f'CSS extracted to: {css_path}')
print(f'Size: {len(final_css)} chars')

# ── 5. Remove <style> block from MomentList.svelte ──
new_content = content[:style_match.start()] + content[style_match.end():]
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Removed <style> block from MomentList.svelte')

# ── 6. Add data-moment-page to root div ──
old_root = '<div class="moment-page moment-page--{urlPrefix}">'
new_root = '<div class="moment-page moment-page--{urlPrefix}" data-moment-page>'
if old_root in new_content:
    new_content = new_content.replace(old_root, new_root)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Added data-moment-page attribute to root div')
else:
    print('WARNING: root div pattern not found!')
    # Check what the root looks like
    idx = new_content.find('moment-page')
    if idx > 0:
        print(f'Found at: ...{new_content[idx:idx+80]}...')
