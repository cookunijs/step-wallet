import { registerRootComponent } from 'expo';
import { activateKeepAwake } from 'expo-keep-awake';

import App from './src/app';

if (__DEV__) {
  activateKeepAwake();
}

registerRootComponent(App);
