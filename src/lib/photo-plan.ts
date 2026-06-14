export type ExistingPhotoForPlan = {
  id: string;
  path: string;
};

type PhotoPlanItem = {
  type: "existing" | "new";
  id?: string;
};

export type ResolvedPhotoPlan = {
  ordered: Array<
    | {
        type: "existing";
        id: string;
        path: string;
        sortOrder: number;
      }
    | {
        type: "new";
        path: string;
        sortOrder: number;
      }
  >;
  removed: ExistingPhotoForPlan[];
};

function isPhotoPlanItem(value: unknown): value is PhotoPlanItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as { type?: unknown; id?: unknown };
  return (item.type === "existing" || item.type === "new") && (typeof item.id === "string" || typeof item.id === "undefined");
}

export function resolvePhotoPlan({
  planJson,
  existingPhotos,
  savedPhotoPaths,
}: {
  planJson?: string;
  existingPhotos: ExistingPhotoForPlan[];
  savedPhotoPaths: string[];
}): ResolvedPhotoPlan {
  const existingById = new Map(existingPhotos.map((photo) => [photo.id, photo]));

  if (!planJson) {
    if (!savedPhotoPaths.length) {
      return {
        ordered: existingPhotos.map((photo, index) => ({ ...photo, type: "existing", sortOrder: index })),
        removed: [],
      };
    }

    return {
      ordered: savedPhotoPaths.map((path, index) => ({ type: "new", path, sortOrder: index })),
      removed: existingPhotos,
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(planJson);
  } catch {
    parsed = [];
  }
  const plan = Array.isArray(parsed) ? parsed.filter(isPhotoPlanItem) : [];
  const ordered: ResolvedPhotoPlan["ordered"] = [];
  const keptExistingIds = new Set<string>();
  let nextUploadIndex = 0;

  for (const item of plan) {
    if (item.type === "existing" && item.id) {
      const existing = existingById.get(item.id);

      if (existing && !keptExistingIds.has(existing.id)) {
        keptExistingIds.add(existing.id);
        ordered.push({
          type: "existing",
          id: existing.id,
          path: existing.path,
          sortOrder: ordered.length,
        });
      }
      continue;
    }

    if (item.type === "new") {
      const path = savedPhotoPaths[nextUploadIndex];
      nextUploadIndex += 1;

      if (path) {
        ordered.push({
          type: "new",
          path,
          sortOrder: ordered.length,
        });
      }
    }
  }

  while (nextUploadIndex < savedPhotoPaths.length) {
    ordered.push({
      type: "new",
      path: savedPhotoPaths[nextUploadIndex],
      sortOrder: ordered.length,
    });
    nextUploadIndex += 1;
  }

  return {
    ordered,
    removed: existingPhotos.filter((photo) => !keptExistingIds.has(photo.id)),
  };
}
