module.exports = {
    extends: ['react-app'],
    rules: {
      // Disable React useEffect dependency warning
      'react-hooks/exhaustive-deps': 'off', // Turns off warnings for missing dependencies in useEffect
      'no-loop-func': 'off', // Disable "function declared in a loop" warning
    }
  };
  