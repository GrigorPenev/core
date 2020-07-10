var concat = require( 'gulp-concat' );
var terser = require( 'gulp-terser' );
var insert = require( 'gulp-insert' );

/* global require */
module.exports = function( grunt ) {
	grunt.registerTask( 'build', require( './buildScripts/task' ) );

	var sources = [
		'./buildScripts/ns.js',
		'./src/js/utils/utils.js',
		'./src/js/utils/EventEmitter.js',
		'./src/js/utils/DragListener.js',
		'./src/js/**'
	];

	var basicGulpStream = function( stream ) {
		return stream
			.pipe( concat( 'goldenlayout.js' ) )
			.pipe( insert.wrap( '(function($){', '})(window.$);' ) );
	};

	// Project configuration.
	grunt.initConfig( {
			pkg: grunt.file.readJSON( 'package.json' ),

			/***********************
			 * WATCH
			 ***********************/
			watch: {
				tasks: [ 'dist', 'test' ],
				files: [ './src/**', './test/**' ],
				options: { livereload: 5051 },
			},

			/***********************
			 * RELEASE
			 ***********************/
			release: {
				options: {
					additionalFiles: [ 'bower.json' ],
					beforeRelease: [ 'less', 'gulp:gl', 'gulp:glmin' ],
					tagName: 'v<%= version %>',
					github: {
						repo: 'deepstreamIO/golden-layout',
						accessTokenVar: 'GITHUB_ACCESS_TOKEN'
					}
				}
			},
			/***********************
			 * GULP
			 ***********************/
			gulp: {
				gl: {
					options: {
						tasks: basicGulpStream
					},
					src: sources,
					dest: 'dist/goldenlayout.js'
				},
				glmin: {
					options: {
						tasks: function( stream ) {
							return basicGulpStream( stream )
								.pipe( terser() )
								.pipe( concat( 'goldenlayout.min.js' ) );
						}
					},
					src: sources,
					dest: 'dist/goldenlayout.min.js'
				}
			},
		less: {
			development: {
				options: {
					compress: true,
					optimization: 2,
					sourceMap: true
				},
				files: [{
					expand: true,
					flatten: true,
					src: ['src/less/goldenlayout-base.less', 'src/less/glue42-light-theme.less', 'src/less/glue42-dark-theme.less'],
					ext: ".css",
					dest: "src/css/"
				}]
			}
		}
	}
	);

	grunt.loadNpmTasks( 'grunt-contrib-less' );

	// Default task(s).
	grunt.registerTask( 'default', [ 'watch' ] );

	// travis support
	grunt.registerTask( 'test', [ 'karma:travis' ] );

	// distribution support
	grunt.registerTask( 'dist', [ 'build', 'less', 'gulp' ] );
};
