declare module '*.css' {
  const css: string;
  export default css;
}

declare module 'react-router-dom' {
  export type Location = {
    pathname: string;
    search: string;
    hash: string;
    state?: unknown;
    key?: string;
  };

  export function BrowserRouter(props: {
    children?: React.ReactNode;
  }): JSX.Element;
  export function Routes(props: { children?: React.ReactNode }): JSX.Element;
  export function Route(props: {
    path?: string;
    element?: React.ReactNode;
    children?: React.ReactNode;
    index?: boolean;
  }): JSX.Element;
  export function Link(
    props: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      to: string;
      replace?: boolean;
      state?: unknown;
      reloadDocument?: boolean;
      children?: React.ReactNode;
    },
  ): JSX.Element;
  export function useNavigate(): (
    to:
      | string
      | number
      | { pathname: string; search?: string; hash?: string; state?: unknown },
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  export function useLocation(): Location;
}
