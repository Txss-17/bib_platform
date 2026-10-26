type Result<T> = { data: T[] | null; error: { message: string } | null };
interface Query<T> extends PromiseLike<Result<T>> {
  range(from: number, to: number): Query<T>;
}

/** Refuse partial exports instead of silently losing rows at PostgREST's limit. */
export async function readAll<T>(query: () => Query<T>): Promise<Result<T>> {
  const rows: T[] = [];
  const pageSize = 200;
  for (let offset = 0; offset < 50_000; offset += pageSize) {
    const result = await query().range(offset, offset + pageSize - 1);
    if (result.error) return { data: null, error: result.error };
    if (!result.data)
      return { data: null, error: { message: "incomplete_bridge_page" } };
    rows.push(...result.data);
    if (result.data.length < pageSize) return { data: rows, error: null };
  }
  return {
    data: null,
    error: { message: "bridge_export_limit_requires_paged_protocol" },
  };
}

export async function readByIds<T>(
  ids: string[],
  query: (ids: string[]) => Query<T>,
): Promise<Result<T>> {
  const rows: T[] = [];
  for (let offset = 0; offset < ids.length; offset += 200) {
    const result = await readAll(() => query(ids.slice(offset, offset + 200)));
    if (result.error) return { data: null, error: result.error };
    rows.push(...result.data!);
  }
  return { data: rows, error: null };
}
