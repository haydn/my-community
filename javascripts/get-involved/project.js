angular.module('project', ['mongolab']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:ListCtrl}).
      otherwise({redirectTo:'/'});
  });

function ListCtrl($scope, Project) {
  $scope.projects = Project.query();

  $scope.save = function() {
    Project.save($scope.project, function(project) {
      delete $scope.projects;
      $scope.projects = Project.query();

      $scope.project.title = "";
      $scope.project.description = "";
      $scope.project.location = "";
      $scope.project.type = "";
      $scope.project.contact = "";
      $scope.project.name = "";
    });
  }
}
