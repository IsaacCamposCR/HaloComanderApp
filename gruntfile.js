module.exports = function (grunt) {
    //grunt wrapper function 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //grunt task configuration will go here  

        concat: {
            js: { //target
                src: [
                    // External Libraies
                    './app/lib/points-of-interest/js/modernizr.js',
                    './app/lib/lz-string.min.js',
                    './app/lib/Chart.min.js',
                    './app/lib/angular-chart.min.js',
                    './app/lib/angular-material-icons/angular-material-icons.js',
                    './app/lib/angular-1.5.8/angular-resource.js',
                    './app/lib/angular-1.5.8/angular-component-router.js',
                    // Application Code
                    './build/app.angular.js',
                    './build/components/halo-app.component.js',
                    './build/components/player.season.service.js',
                    './build/components/unit.type.service.js',
                    './build/components/game.objects.service.js',
                    './build/components/game.leaders.service.js',
                    './build/components/battle-chart-component/*.js',
                    './build/components/main-component/*.js',
                    './build/components/match-battles-component/*.js',
                    './build/components/match-history-component/*.js',
                    './build/components/match-statistics-component/*.js',
                    './build/components/welcome-component/*.js',
                    './app/components/unit-panel-component/unit.panel.component.js',
                    './app/components/dialog-component/dialog.component.js',
                ],
                dest: './app/public/min/app.js'
            }
        },
        uglify: {
            js: { //target
                src: ['./app/public/min/app.js'],
                dest: './app/public/min/app.js'
            }
        }
    });

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //register grunt default task
    grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
}