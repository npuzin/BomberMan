'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-open');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {

      css: {
        files: 'app/styles/**/*.scss',
        tasks: ['css']
      },

      express: {
        files:  [ './server/**/*.{js,json}' ],
        tasks:  [ 'jshint','express:server' ],
        options: {
          spawn: false
        }
      }

    },

    copy: {

      dist: {
        cwd: 'app/',
        src: ['index.html','styles/main.css','images/**/*.{png,jpg,jpeg,gif}'],
        dest: 'dist/',
        expand: true
      }
    },

    clean: {
      dist: ['dist'],
      tmp: ['.tmp'],
      bowerComponents: ['app/bower_components'],
      saasTmpFile: ['app/styles/main.css.tmp'],
      saas: ['.sass-cache','app/styles/main.css'],
      templates: ['.tmp/concat/scripts/templates.js']
    },

    sass: {

      dist: {
        files: {
          'app/styles/main.css.tmp': 'app/styles/main.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 20 versions']
      },

      dist: {
        src: 'app/styles/main.css.tmp',
        dest: 'app/styles/main.css',
      },

    },

    ngtemplates:  {
      app:        {
        src:      'templates/**/*.html',
        cwd:      'app',
        dest:     '.tmp/concat/scripts/templates.js',
        options: {
          module: '<%= pkg.name %>',
          htmlmin: {
            removeComments: true,
            collapseWhitespace: true
          }
        }
      }
    },

    bower: {
      install: {
        options: {
          copy: false
        }
      }
    },

    concat: {

      templates: {


        src: ['.tmp/concat/scripts/scripts.min.js','.tmp/concat/scripts/templates.js'],
        dest: '.tmp/concat/scripts/scripts.min.js'

      }
    },

    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/styles/{,*/}*.css'],

      options: {
        assetsDirs: ['dist'],
      }
    },

    rev: {
      dist: {
        files: {
          src: [
            'dist/scripts/**/*.js',
            'dist/styles/**/*.css',
            'dist/images/**/*.{png,jpg,jpeg,gif}'
          ]
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'app/scripts/**/*.js',
        'server/*.js'
      ]
    },

    express: {

      server: {
        options: {
          script: './server/server.js',
          debug: true
        }
      }
    },

    open: {

      debugPage : {
        path: 'http://localhost:8080/debug?port=5858'
      },
      appPage : {
        path: 'http://localhost:9001'
      },
    },

    bgShell: {
      'node-inspector': {
        cmd: 'node-inspector',
        bg: true
      }
    },

    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    }

  });

  grunt.task.registerTask('renameProject', 'Change the project name.', function(newProjectName) {

    if (!newProjectName) {
      grunt.log.error('the new project name parameter is missing');
    } else {

      var options = {
        renameProject: {
          src: ['app/scripts/**/*.js','package.json','bower.json','app/index.html'],
          overwrite: true,
          replacements: [{
            from: '<%= pkg.name %>',
            to: newProjectName
          }]
        }
      };
      grunt.config('replace',options);
      grunt.task.run('replace:renameProject');
    }
  });

  grunt.registerTask('css', ['sass','autoprefixer','clean:saasTmpFile']);

  grunt.registerTask('build', ['bower','css','jshint']);

  grunt.registerTask('package', [
    'clean:dist',
    'build',
    'copy',
    'useminPrepare',
    'concat',
    'ngtemplates',
    'concat:templates',
    'clean:templates',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'clean:tmp'
  ]);

  grunt.registerTask('dev', ['build','bgShell:node-inspector','open','express:server','watch']);

  grunt.registerTask('dist', ['package','express:server']);
};
