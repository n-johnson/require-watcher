module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: [
          {'dist/index.js': 'src/index.js'},
          {'dist/lib/t.js': 'src/lib/t.js'},
          {'dist/lib/RequireUtils.js': 'src/lib/RequireUtils.js'}]
      }
    },

    clean: {
      build: ['dist/']
    }
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'babel']);
};
