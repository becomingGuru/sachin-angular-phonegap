'use strict';

angular.module('app.controllers')
  .controller('MainCtrl', function ($scope, $location, $rootScope) {
    $scope.colors = ['#334D5C','#45b29d','#EFC94C','#E27A3F','#DF5A49', '#25ADA7','#A1D87F','#FF453C','#EFC94C','#AF709A','#FFD530', '#0E229B', '#A4A1CC','#25ADA7','#A1D87F','#FF453C','#EFC94C','#AF709A','#FFD530', '#0E229B', '#A4A1CC', '#25ADA7'];
    
    $scope.tiles = [{name: 'Career Summary', url: '#/summary', class:'col-md-3'},{name: 'Score Buckets<br/>&<br/>Won/Lost Counts', url: '#/ScoreBuckets', class:'col-md-3'},{name: 'Won/Lost By<br/>&<br/>Match Counts', url: '#/ResultBuckets', class:'col-md-3'},{name: 'Won/Lost<br/>&<br/>Centuries vs Inning', url: '#/WonLostCenturiesInnning', class:'col-md-3'},{name: 'Life Time<br/>Chart', url: '#/LifeTimeChart', class:'col-md-3'}, {name: 'Sachin<br/>vs<br/>Other Batsmen', url: '#/RecordChart', class:'col-md-3'}, {name: 'Social<br/>Feed', url: '#/SocialFeed', class:'col-md-3'}];

    $scope.$watch(function(){ return $location.path()}, function(value){
      $rootScope.currentView = value;
      console.log($rootScope.currentView);
    })
  })

  .controller('SummaryCtrl', function($scope, Data, PieChartOptions){

    var get_series_data = function(api_data, chosen_json, chosen_attr){
      var colorsArray = ['#25ADA7','#A1D87F','#FF453C','#EFC94C','#AF709A','#FFD530', '#0E229B', '#A4A1CC','#25ADA7','#A1D87F','#FF453C','#EFC94C','#AF709A','#FFD530', '#0E229B', '#A4A1CC', '#25ADA7'];
      var series_data = []
      var total_this_stat = $.map(api_data[chosen_json], function(x){return +x.Runs}).reduce(function(previousValue, currentValue){ return previousValue + currentValue;})
      console.log(total_this_stat);
      var i = 0;
      for(var each_stat in api_data[chosen_json]){
        var s = api_data[chosen_json][each_stat];
        series_data.push({
          name : s.name,
          percent_y :+(+(s[chosen_attr])/total_this_stat*100).toFixed(1),
          y : +(s[chosen_attr]),
          color : colorsArray[i++]
        });
      }
      console.log(series_data);
      return series_data;
    }

    var plot_graph = function(){
      var chosen_json = $scope.chosen_option.json_option;
      var chosen_attr = $scope.chosen_option.attr_option;
      var api_data = $scope.r_api_data;

      var series_data = get_series_data(api_data,chosen_json,chosen_attr);
      var chart_data = angular.copy(PieChartOptions.simplePie);
      chart_data.series = [{name:chosen_json, type: 'pie', data:series_data}];
      chart_data.plotOptions.pie.dataLabels = {
                                                enabled: true,
                                                color: '#000000',
                                                connectorColor: '#000000',
                                                formatter: function() {
                                                                        // display only if larger than 1
                                                                        if($scope.chosen_option.attr_option === "Centuries"){
                                                                          return '<b>'+ this.point.name +' Centuries:</b> '+ this.y +'';  
                                                                        }
                                                                        else if($scope.chosen_option.attr_option === "Matches"){
                                                                          return '<b>'+ this.point.name +' Matches:</b> '+ this.y +'';  
                                                                        }
                                                                        else{
                                                                          return '<b>'+ this.point.name +' runs:</b> '+ this.y +'';   
                                                                        }
                                                                        
                                                }
                                              }
      console.log(chart_data)
      $scope.chosenStat = chart_data;
    }

    $scope.$watch('chosen_option',function(chosen_option){
      if ($scope.r_api_data){
        plot_graph();
      }
    },true)

    Data.get_local('scripts/lib/sachin_odi_summary.json').success(function(api_data){
      $scope.r_api_data = api_data;

      $scope.charting_options = function(){
        var json_options = _.keys(api_data);

        var get_attr_options = function(){
          var all_attrs = _.keys(api_data[json_options[0]][0]);
          console.log(all_attrs);
          var name_index = all_attrs.indexOf("name");
          all_attrs.splice(name_index,1);
          return all_attrs
        }
        return {
          json_options: json_options,
          attr_options: get_attr_options()
        }
      }()

      $scope.chosen_option = {
        json_option: $scope.charting_options.json_options[0],
        attr_option: $scope.charting_options.attr_options[1]
      }
      
      plot_graph();
    });
  });
 
window.onload = window.onresize = window.onorientationchange = function(){
  sizeUI();
}

var screenWidth, tileCount, tileSize, chartWidth, fontSize;

function sizeUI() {
  fontSize = '22px';
  screenWidth = window.innerWidth;
  if(screenWidth < 320){
    tileCount = 2;
  } else {
    tileCount = Math.round(screenWidth / 160);
  }  
  tileSize = (screenWidth - 4) / tileCount;
  chartWidth = screenWidth;
  
  if(screenWidth < 200) {
    fontSize = '12px';  
  } else if(screenWidth < 270) {
    fontSize = '18px';
  }

  $('h2').css({'font-size': fontSize});
  $('.col-md-3').css({'width': tileSize+'px', 'height': tileSize+'px'});
}