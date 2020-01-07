import { KeepAwake, registerRootComponent } from 'expo';
import App from './src/app'

if (__DEV__) {
  KeepAwake.activate();
}

registerRootComponent(App);