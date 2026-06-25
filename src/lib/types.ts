export type ViewSearchParams = {
  selected: string | undefined;
  detail: string | undefined;
  tab: string | undefined;
  panel: string | undefined;
};

export const emptyViewSearch: ViewSearchParams = {
  selected: undefined,
  detail: undefined,
  tab: undefined,
  panel: undefined,
};
