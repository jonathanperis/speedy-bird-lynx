export const SECTION_CATEGORIES = [
  { label: "", ids: ["home"] },
  { label: "Overview", ids: ["about-lynx", "architecture"] },
  { label: "Engine", ids: ["game-engine", "assets-and-sprites"] },
  { label: "Deploy", ids: ["getting-started", "native-host-apps", "ci-cd-pipeline"] },
] as const;

export const SECTION_ORDER = SECTION_CATEGORIES.flatMap(({ ids }) => ids);
