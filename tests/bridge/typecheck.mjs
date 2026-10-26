import { writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
const here = import.meta.dirname;
const repository = resolve(here, "../..");
const platform = resolve(process.env.BIB_PLATFORM_ROOT ?? repository);
const intranet = resolve(
  process.env.BIB_INTRANET_ROOT ?? resolve(repository, "../bib_intranet"),
);
const file = resolve(here, ".tsconfig.generated.json");
const config = {
  compilerOptions: {
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "Bundler",
    noEmit: true,
    allowImportingTsExtensions: true,
    skipLibCheck: true,
    strict: false,
    baseUrl: repository,
    lib: ["ES2022", "DOM"],
    paths: {
      "npm:zod@3": ["node_modules/zod"],
      "npm:@supabase/supabase-js@2": ["node_modules/@supabase/supabase-js"],
      "npm:@supabase/supabase-js@2/cors": [resolve(here, "cors.ts")],
    },
  },
  files: [
    resolve(here, "deno.d.ts"),
    ...["intranet-import", "intranet-export", "partner-portal-action"].map(
      (name) => platform + "/supabase/functions/" + name + "/index.ts",
    ),
    intranet + "/supabase/functions/platform-bridge/index.ts",
  ],
};
try {
  writeFileSync(file, JSON.stringify(config));
  execFileSync(
    process.execPath,
    [resolve(repository, "node_modules/typescript/bin/tsc"), "-p", file],
    { stdio: "inherit" },
  );
} finally {
  rmSync(file, { force: true });
}
