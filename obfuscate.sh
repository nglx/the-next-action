cat public/js/completecol.js > tmp/all.js
cat public/js/metadata.js >> tmp/all.js
cat public/js/taskchange.js >> tmp/all.js
cat public/js/task.js >> tmp/all.js
cat public/js/project.js >> tmp/all.js
cat public/js/context.js >> tmp/all.js
cat public/js/main.js >> tmp/all.js
cat public/js/offline.js >> tmp/all.js

java -cp vendor/js.jar -jar vendor/shrinksafe.jar tmp/all.js > public/js/c/all.js
java -cp vendor/js.jar -jar vendor/shrinksafe.jar public/js/offline-worker.js > public/js/c/offline-worker.js
java -cp vendor/js.jar -jar vendor/shrinksafe.jar public/js/sync-worker.js > public/js/c/sync-worker.js
java -cp vendor/js.jar -jar vendor/shrinksafe.jar public/js/migrate-worker.js > public/js/c/migrate-worker.js

perl -pi -e 's/js\/sync-worker\.js/js\/c\/sync-worker\.js/g' public/js/c/all.js
perl -pi -e 's/js\/offline-worker\.js/js\/c\/offline-worker\.js/g' public/js/c/all.js
perl -pi -e 's/js\/migrate-worker\.js/js\/c\/migrate-worker\.js/g' public/js/c/all.js
ls public/js/c/*.js | xargs perl -pi -e 's/console\.log(.*)//g'
rm tmp/all.js