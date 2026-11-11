#!/usr/bin/env bash
# Offline verification of a Lovable Cloud custom-format PostgreSQL archive.
# This script NEVER connects to a database, exports rows, or restores data.
# Usage: bash scripts/migration/check-backup.sh /secure/path/bib-talent_261111.backup
set -Eeuo pipefail
export LC_ALL=C
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: $0 /path/to/bib-talent_261111.backup" >&2
  exit 2
fi
for cmd in pg_restore sha256sum awk grep mktemp; do
  command -v "$cmd" >/dev/null || { echo "Missing tool: $cmd" >&2; exit 3; }
done
archive="$1"
if [[ "$(head -c 5 "$archive")" != "PGDMP" ]]; then
  echo "ERROR: not a PostgreSQL custom archive (PGDMP)" >&2
  exit 4
fi
actual=$(sha256sum "$archive" | awk '{print $1}')
expected="0d4232ed616efacc39d5f2336168af8ec8d4cd88062a6a0b900f30d439dbbfbf"
if [[ "$actual" != "$expected" ]]; then
  echo "ERROR: SHA-256 mismatch; expected $expected actual $actual" >&2
  exit 5
fi
toc=$(mktemp)
trap 'rm -f "$toc"' EXIT
if ! pg_restore --list "$archive" > "$toc"; then
  echo "ERROR: pg_restore could not read the archive table of contents" >&2
  exit 6
fi
# Count object types using parsed semicolon-delimited TOC entries, not raw binary strings.
count_type() {
  local kind="$1" schema="$2"
  awk -v k="$kind" -v s="$schema" '
    $0 !~ /^[;]/ && index($0, " " k " " s " ") > 0 {n++}
    END {print n+0}
  ' "$toc"
}
assert_min(){
  local type="$1" schema="$2" expected_count="$3"
  local found
  found=$(count_type "$type" "$schema")
  echo "$type $schema: $found (expected $expected_count)"
  [[ "$found" == "$expected_count" ]] || { echo "ERROR: TOC object count mismatch: $type $schema" >&2; exit 7; }
}
assert_min TABLE public 79
assert_min "TABLE DATA" public 79
assert_min FUNCTION public 110
assert_min TRIGGER public 70
for entry in "TABLE auth users" "TABLE DATA auth users" "TABLE storage objects" "TABLE DATA storage objects"; do
  if [[ "$entry" == "TABLE DATA "* ]]; then
    kind="TABLE DATA"
    schema=$(awk '{print $3}' <<< "$entry")
    object=$(awk '{print $4}' <<< "$entry")
  else
    kind="TABLE"
    schema=$(awk '{print $2}' <<< "$entry")
    object=$(awk '{print $3}' <<< "$entry")
  fi
  if ! awk -v k="$kind" -v s="$schema" -v n="$object" '
      $0 !~ /^;/ && index($0, " " k " " s " " n " ") > 0 {ok=1}
      END {exit !ok}
    ' "$toc"; then
    echo "ERROR: missing TOC section: $entry" >&2
    exit 8
  fi
done
echo "TOC verified; SHA-256: $actual"
echo "NOTE: a valid TOC is not a successful restore. Storage objects require separate binary transfer."
