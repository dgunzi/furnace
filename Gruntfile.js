module.exports = function(grunt) {
	
  var pkg = grunt.file.readJSON('package.json');	
  var cfg = {
    src: 'src/',
    // Change 'localhost' to '0.0.0.0' to access the server from outside.
    serverHost: '0.0.0.0',
    serverPort: 8090,
    livereload: 35729
  };
  	
  grunt.initConfig({
  	pkg: pkg,
    cfg: cfg,
    
    //开启服务
    connect: {
      options: {
        port: cfg.serverPort,
        hostname: cfg.serverHost,
        middleware: function(connect, options) {
          return [
            require('connect-livereload')({
              port: cfg.livereload
            }),
            // Serve static files.
            connect.static(options.base),
            // Make empty directories browsable.
            // connect.directory(options.base),
          ];
        }
      },
      server: {
        options: {
          // keepalive: true,
          base: cfg.src,
        }
      }
    },

    //打开浏览器
    open: {
      server: {
        url: 'http://localhost:' + cfg.serverPort
      }
    },

    //监控文件变化
    watch: {
      options: {
        livereload: cfg.livereload,
      },
      server: {
        files: [cfg.src + '/**'],
        // tasks: [''],
      },
    },
    
    clean: {
      main: ['.tmp*']
    },
    transport: {
      js: {
        options: {
          alias: {
            '$': 'jquery/jquery/1.10.1/jquery'
          }
        },
        files: [{
          expand: true,
          cwd: 'static',
          src: '**/*.js',
          dest: '.tmp1'
        }]
      }
    },
    concat: {
      js: {
        options: {
          include: 'relative'
        },
        files: [{
          expand: true,
          cwd: '.tmp1',
          src: '**/*.js',
          filter: function(filepath) {
            return !/-debug\.js$/.test(filepath);
          },
          dest: '.tmp2'
        }]
      }
    },
    uglify: {
      js: {
        files: [{
          expand: true,
          cwd: '.tmp2',
          src: '**/*.js',
          dest: 'sea-modules'
        }]
      }
    },git@github.com
    css_combo: {
	    options: {
	      debug: false,
	      compress: true
	    },
	    main: {
	    	files: {
	      		'static/css/style.min.css': ['static/css/style.css']
	    	}
	    }
	  }
  });
  
  //load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  //define tasks
  grunt.registerTask('server', ['connect:server', 'open:server', 'watch:server']);
  grunt.registerTask('default', ['css_combo']);
  grunt.registerTask('create', ['clean', 'transport', 'concat', 'uglify', 'clean']);
};
