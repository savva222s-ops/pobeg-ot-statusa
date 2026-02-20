# Побег от статуса

HTML-игра в стиле Pac-Man:
- Игрок: офисный работник.
- Враги: листы бумаги (статусы).
- Цель: собрать все стаканчики кофе на карте.
- Версия `index.html` теперь полностью автономная (CSS/JS/ассеты внутри одного файла).

## Запуск на Mac

1. Открой терминал:
```bash
cd /Users/sevastyansemenov/Desktop/Nice\ code/pobeg-ot-statusa
```

2. Запусти локальный сервер:
```bash
python3 -m http.server 8080
```

3. Открой в браузере:
- http://localhost:8080

## Управление

- `WASD` или стрелки: движение
- На телефоне: экранные кнопки направления
- `Начать заново`: рестарт

## Отправка файла

Можно отправлять только один файл:

`/Users/sevastyansemenov/Desktop/Nice code/pobeg-ot-statusa/index.html`

## Публикация для Telegram (GitHub Pages)

В проект уже добавлен workflow:

`/Users/sevastyansemenov/Desktop/Nice code/pobeg-ot-statusa/.github/workflows/deploy-pages.yml`

1. Создай пустой репозиторий на GitHub, например `pobeg-ot-statusa`.
2. Запушь эту папку в ветку `main`:
```bash
cd /Users/sevastyansemenov/Desktop/Nice\ code/pobeg-ot-statusa
git init
git add .
git commit -m "Initial game build"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/pobeg-ot-statusa.git
git push -u origin main
```
3. Открой GitHub: `Settings -> Pages`, источник: `GitHub Actions`.
4. После выполнения workflow игра будет доступна по ссылке:

`https://<YOUR_GITHUB_USERNAME>.github.io/pobeg-ot-statusa/`

Эту ссылку отправляй в Telegram: на телефоне игра открывается корректно как веб-страница.
