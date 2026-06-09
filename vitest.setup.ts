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
  const createMockIcon = (name: string) => {
    const MockIcon = () => null;
    MockIcon.displayName = name;
    return MockIcon;
  };

  return new Proxy(
    {
      createLucideIcon: (name: string) => createMockIcon(name),
      useLucideContext: () => ({}),
      LucideProvider: ({ children }: any) => children,
    },
    {
      get(target, prop) {
        if (prop in target) {
          return target[prop as keyof typeof target];
        }
        if (typeof prop === 'string') {
          return createMockIcon(prop);
        }
        return undefined;
      },
    }
  );
});
