export type ViewSearchParams = {
  state: string | undefined;
  mode: string | undefined;
  selected: string | undefined;
  view: string | undefined;
  grid: string | undefined;
  detail: string | undefined;
  tab: string | undefined;
  sw: string | undefined;
};

export const emptyViewSearch: ViewSearchParams = {
  state: undefined,
  mode: undefined,
  selected: undefined,
  view: undefined,
  grid: undefined,
  detail: undefined,
  tab: undefined,
  sw: undefined,
};
