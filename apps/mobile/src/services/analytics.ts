export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

export const analytics = {
  track: (_event: AnalyticsEvent) => {},
};
