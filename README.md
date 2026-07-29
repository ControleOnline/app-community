# App Controle Online

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/controleonline/app-community/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/controleonline/manager-platform-community/?branch=master)

<a href="https://github.com/ControleOnline/app-community" target="_blank">
  <img src="https://www.cielo.com.br/assets_cielo/cielo_store/features/mobile/cielo-lio.png" />
</a>


### Install
```bash
git submodule update --init --recursive
git submodule update --recursive
npm install
npx expo prebuild -p android --clean
```

### Run Android
```bash
npx expo run:android
```

### Build Android
```bash
cd android
./gradlew bundleRelease --init-script ../signing.gradle
```

### Browser smoke tests
```bash
npm run test:browser:install
npm run test:browser
```

The browser suite now exports the web app once per `APP_TYPE`, serves each export with a tiny static server, and runs the grouped Playwright smoke tests from `src/tests/browser/<app_type>/`.

To run a single group:
```bash
npm run test:browser:manager
npm run test:browser:delivery
npm run test:browser:pos
```



### Comercial Contacts

<a href="https://www.controleonline.com/" target="_blank">
  <img src="https://www.controleonline.com/wp-content/uploads/2018/09/logo_cc_sembranco.svg" />
</a>



### Contact for Developers

<a href="https://chat.whatsapp.com/KtplmnuqcXK9nIETLcYBGt" target="_blank">
  <img src="https://static.whatsapp.net/rsrc.php/yZ/r/JvsnINJ2CZv.svg" />
</a>

### Top contributors

<a href="https://github.com/ControleOnline/app-community/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=ControleOnline/app-community" />
</a>


