git init
git remote add origin https://github.com/NANNO35578/calcite_web.git
git branch -m main
git pull origin main

nvim Readme.md

npm create vite@latest calcite-web -- --template vue
cd calcite-web
npm install
npm run dev

npm install axios vue-router element-plus md-editor-v3

git add .
git commit -m "init && basic framework"
git push -u origin main

git add .
git commit -m "FEnd: Integrated User Module UI based on APIs"
git push origin main

git add .
git commit -m "FEnd: Notes Module UI integrated based on APIs"
git push origin main