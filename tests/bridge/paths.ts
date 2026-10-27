import { resolve } from "node:path";
const repository = resolve(import.meta.dirname, "../..");
export const platform = resolve(process.env.BIB_PLATFORM_ROOT ?? repository);
export const intranet = resolve(
  process.env.BIB_INTRANET_ROOT ?? resolve(repository, "../bib_intranet"),
);
