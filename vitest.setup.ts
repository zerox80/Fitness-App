import { vi } from 'vitest';

vi.mock('react-native-svg', () => {
  const Svg = ({ children, ...props }: any) => {
    const React = require('react');
    return React.createElement('svg', props, children);
  };
  const Circle = (props: any) => {
    const React = require('react');
    return React.createElement('circle', props);
  };
  const Path = (props: any) => {
    const React = require('react');
    return React.createElement('path', props);
  };
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Circle,
    Path,
  };
});

vi.mock('lucide-react-native', () => {
  const handler = {
    get(target: any, prop: string) {
      if (prop in target) return target[prop];
      return () => null;
    },
  };
  return new Proxy(
    {
      createLucideIcon: () => () => null,
      useLucideContext: () => ({}),
      LucideProvider: ({ children }: any) => children,
    },
    handler
  );
});
