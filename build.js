var metalsmith = require('metalsmith'),
    branch = require('metalsmith-branch'),
    collections = require('metalsmith-collections'),
    excerpts = require('metalsmith-better-excerpts'),
    layouts = require('metalsmith-layouts'),
    inplace = require('metalsmith-in-place'),
    asciidoc = require('metalsmith-asciidoc'),
    markdown = require('metalsmith-markdown'),
    permalinks = require('metalsmith-permalinks'),
    serve = require('metalsmith-serve'),
    watch = require('metalsmith-watcher'),
    redirect = require('metalsmith-redirect'),
    msIf = require('metalsmith-if'),
    moment = require('moment'),
    fs = require('fs'),
    filepath = require('metalsmith-filepath'),
    branch = require('metalsmith-branch'),
    headings = require('metalsmith-headings'),
    frontmatter = require('metalsmith-matters'),
    include = require('metalsmith-include-content'),
    paths = require('metalsmith-paths')
;

moment.locale('en', {
  calendar : {
    lastDay : '[Yesterday, ] MMM Do',
    sameDay : '[Today, ] MMM Do',
    lastWeek : '[last] dddd[, ] MMM Do',
    sameElse : 'll'
  }
});

build();

function build() {
  var serveAndWatch = process.argv.length > 2 && process.argv[2] === 'serve',
      metadata = JSON.parse(fs.readFileSync('./site.json', 'utf8'));

  metadata.devMode = serveAndWatch;

  metalsmith(__dirname)
    .frontmatter(false)
    .metadata(metadata)
    .source('./src')
    .destination('./build')

    .use(frontmatter({

    }))

    .use(paths())

    /*.use(include({
      pattern: '^include::(.*)',
      ignoreMissing: false,
    }))*/

    // Write pages in asciidoc or markdown
    .use(asciidoc())
    .use(markdown())

    .use(excerpts({
      pruneLength: 300,
    }))

    .use(collections({
        datasources: {
          sortBy: 'date',
          metadata: {
            name: "Datasource Examples"
          }
        },
        configuration: {
          sortBy: 'date',
          metadata: {
            name: "Configuration Options"
          }
        },
        management: {
          sortBy: 'date',
          metadata: {
            name: "Monitoring & Management"
          }
        },
        rest: {
          sortBy: 'date',
          metadata: {
            name: "REST & HTTP"
          }
        },
        assorted: {
          sortBy: 'date',
          metadata: {
            name: "Other Topics"
          }
        }

      }))

    .use(filepath({
      absolute: true,
      permalinks: false
    }))

    .use(headings('h2'))

    .use(layouts({
      engine: 'handlebars',
      default: 'page.hbt',
      "partials": "partials"
    }))

    /*.use(inplace({
      engine: 'handlebars',
      "partials": "partials"
    }))*/

    // when we run as `node build serve` we'll serve the site and watch
    // the files for changes. Note: This does not reload when templates
    // change, only when the content changes
    .use(msIf(
      serveAndWatch,
      serve({
        port: 8080,
        verbose: true
    })))
    .use(msIf(
      serveAndWatch,
      watch()
    ))

    .use(redirect({
      '/documentation/HEAD': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/',
      '/documentation/1-0-0-Alpha6': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/1.0.0.Alpha6/',
      '/documentation/1-0-0-Alpha8': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/1.0.0.Alpha8/',
      '/documentation/1-0-0-Beta6': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/1.0.0.Beta6/',
      '/documentation/1-0-0-Beta7': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/c38f5393fe4313665f197b1f01bc73727e6a21c5/',
    }))

    .build(function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      else {
        console.log('Site build complete.');
        if (process.argv.length > 2 && process.argv[2] === 'publish') {
          publish();
        }
      }
    });
}

function publish() {

  var ghpages = require('gh-pages'),
      path = require('path'),
      options = {
        user: {
          name: 'Project:Odd CI',
          email: 'ci@torquebox.org'
        },
        dotfiles: true
      };

  ghpages.publish(path.join(__dirname, 'build'), options, function(err) {
    if (err) {
      console.error("Cannot publish site. " + err);
      throw err;
    }
    else
      console.log('Site published.');
  });

}

function sorter(order) {
  order = order || [];

  return function(one, two) {
    var a = one.sidebar || one.title;
    var b = two.sidebar || two.title;

    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    var i = order.indexOf(a);
    var j = order.indexOf(b);

    if (~i && ~j) {
      if (i < j) return -1;
      if (j < i) return 1;
      return 0;
    }

    if (~i) return -1;
    if (~j) return 1;

    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a[0] === '.') return 1;
    if (b[0] === '.') return -1;
    if (a < b) return -1;
    if (b < a) return 1;
    return 0;
  };
}
