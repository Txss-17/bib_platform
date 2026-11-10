import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const exportSource=readFileSync(new URL('../../supabase/functions/intranet-export/index.ts',import.meta.url),'utf8');
test('export failure names missing Platform source without inventing empty favorites',()=>{
 assert.match(exportSource,/sourceFailures/);
 assert.match(exportSource,/customer_product_favorites/);
 assert.match(exportSource,/customer_boutique_favorites/);
 assert.match(exportSource,/platform_export_required_sources_unavailable/);
 assert.match(exportSource,/source_tables: sourceFailures\.map/);
 assert.match(exportSource,/source_app: 'bib_platform'/);
 assert.match(exportSource,/retryable: true/);
 assert.match(exportSource,/\}, 503\);/);
 assert.doesNotMatch(exportSource,/if \(productFavorites\.error\) productFavorites\.data = \[\]/);
});
