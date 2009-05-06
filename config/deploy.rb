set :application, "thenextaction-beta"
set :repository,  "https://svn.tytanet.com.pl/ssm/trunk/GTD"
set :user, "thewayo"
set :use_sudo, false

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :deploy_to, "/home/thewayo/#{application}"

# If you aren't using Subversion to manage your source code, specify
# your SCM below:
# set :scm, :subversion

role :app, "thewayout.eu"
role :web, "thewayout.eu"
role :db,  "thewayout.eu", :primary => true

namespace :passenger do
  desc "Restart Application"
  task :restart do
    run "cd #{current_path} && chmod -R 755 *"
    #run "touch #{current_path}/tmp/restart.txt"
  end
end

after :deploy, "passenger:restart"