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
