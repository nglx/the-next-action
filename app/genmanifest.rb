list = `cd public;find . -type f| egrep '\.\/js\/c\/|\.\/css\/|\.\/db\/|\.\/icons\/|\.\/images\/|\.\/ext\/.*\..*' | grep -v .svn`
list = list.split("\n")

entries = []
entries << { :url => '/'}
entries << { :url => '/favicon.ico'}


list.each{ |l|
  entries << { :url => l[1..(l.size-1)]  }# unless  /ping\.gif$/.match(l)
}
manifest = { :betaManifestVersion => 1, :version => '1.2.12', :entries => entries }

fh = File.new('public/manifest.json','w')
fh.puts manifest.to_json
fh.close