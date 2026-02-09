export interface Request<T extends any[], R extends unknown> {
  args: T;
  resolve: (arg0: Awaited<R>) => void;
  reject: (arg0: Error) => void;
}
