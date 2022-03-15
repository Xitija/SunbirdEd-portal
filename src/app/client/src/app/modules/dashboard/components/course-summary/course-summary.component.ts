
import { Component, OnInit, Input } from '@angular/core';
import { SummaryReportsService } from './../../services';
import { UserService, SearchService } from '@sunbird/core';
import * as _ from 'lodash-es';
import {LayoutService,COLUMN_TYPE}from '@sunbird/shared';
import { map, tap, switchMap, skipWhile, takeUntil, catchError, startWith } from 'rxjs/operators';
import { forkJoin, Subject, Observable, BehaviorSubject, merge, of, concat, combineLatest } from 'rxjs';

/**
 * The CourseSummaryCourses component
 *
 * Display summary reports for cash
 */
@Component({
  selector: 'app-course-summary',
  templateUrl: './course-summary.component.html',
  styleUrls: ['./course-summary.component.scss']
})

/**
 * @class CourseSummaryComponent
*/
export class CourseSummaryComponent implements OnInit{ 

  /**
   * To get logged-in user profile
   */
  userService: UserService;

  /**
   * Default method of CourseSummaryCourses class
   *
   * @param {SummaryReportsService} coursesSummaryCourses To get language constant
   */

  constructor( userService: UserService,
    public coursesSummaryCourses: SummaryReportsService,public layoutService: LayoutService) {
    this.userService = userService;
  }

  courseBatchesData:any;
  arrrayCourseReports : any = [];
  @Input() paginateLimit: number = 12;
  p: any;

  // Bar chart
  barChartLabels:any;
  barChartType = 'bar';
  barChartLegend :boolean= true;
  barChartData:any;
  public barChartOptions:any;
  orgIds : any;
  public barChartColors:any;

  // Pie chart
  pieChartOptions : any;
  pieChartLabels :any;
  pieChartData : any;
  pieChartType = 'pie';
  pieChartLegend : boolean= true;
  pieChartPlugins = [];
  public pieChartColors:any;

  layoutConfiguration: any;
  FIRST_PANEL_LAYOUT;
  SECOND_PANEL_LAYOUT;

  public unsubscribe = new Subject<void>();


  ngOnInit()
  {
    this.coursesSummaryCourses.getCourseSummaryReports(this.userService._rootOrgId).subscribe((res) => {
    if (res.responseCode == "OK") 
    {
      this.courseBatchesData = res.result.content;
      var courseBatchesIds: string[] = [];
      var totalCourseEnrolled: string[] = [];
      var totalCourseCompleted: string[] = [];
      var totalCourseInCompleted: number[] = [];
      var totalCompleted = 0;
      var totalEnrolled = 0;
      var totalIncompleted = 0;
      this.courseBatchesData.forEach(function (value) {

      if(value.batchId || value.totalCompleted)
      {
        courseBatchesIds.push(value.batchName);
        // totalCourseEnrolled.push(value.totalEnrolled);
        totalCourseCompleted.push(value.totalCompleted);

        //for incomplete course calculation
        var courseInComplete = value.totalEnrolled - value.totalCompleted ;
        totalCourseInCompleted.push(courseInComplete);
        totalCompleted = totalCompleted + value.totalCompleted;
        totalEnrolled = totalEnrolled + value.totalEnrolled;         
      }
      });
      totalIncompleted = totalEnrolled - totalCompleted;
      
      // this.createBarGraph(courseBatchesIds,totalCourseEnrolled,totalCourseCompleted);
      this.createBarGraph(courseBatchesIds,totalCourseCompleted,totalCourseInCompleted);

      this.createPieChart(totalIncompleted,totalCompleted);
    }
    },(err) => {
      console.log({ err });
    });
    this.initConfiguration();

  }

  private initConfiguration() {
    this.layoutConfiguration = this.layoutService.initlayoutConfig();
    this.redoLayout();
    this.layoutService.switchableLayout().
        pipe(takeUntil(this.unsubscribe)).subscribe(layoutConfig => {
          if (layoutConfig != null) {
            this.layoutConfiguration = layoutConfig.layout;
          }
          this.redoLayout();
        });
  }
  redoLayout() {
    this.FIRST_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(0, this.layoutConfiguration, COLUMN_TYPE.threeToNine, true);
    this.SECOND_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(1, this.layoutConfiguration, COLUMN_TYPE.threeToNine, true);
  }
  createBarGraph(courseBatcheIds,totalCourseCompleted,totalCourseInCompleted)
  {
    this.barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
    yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Total Completed and Total Incompleted Courses'
        }
    }],
    xAxes: [{
      scaleLabel: {
          display: true,
          labelString: 'Batch Name'
      }
    }]
    },
    title: {
    text: 'Batch wise Completion',
    display: true
    }
    };
    this.barChartLabels = this.trimCourseLabels(courseBatcheIds);
    this.barChartType = 'bar';
    this.barChartLegend = true;
    this.barChartColors = [
      { backgroundColor: 'orange' },
      { backgroundColor: 'green' },
    ];
    this.barChartData = [
      {data: totalCourseInCompleted, label: 'Total Incomplete', stack: 'a'},
      {data: totalCourseCompleted, label: 'Total Completed', stack: 'a'}
    ];
  }

  createPieChart(totalIncompleted,totalCompleted)
  {
    this.pieChartOptions = {
      responsive: true,
      title: {
        text: 'Course Completion Summary',
        display: true
      }
    };

    this.pieChartColors = [
      {
        backgroundColor: [
          'orange',
          'green',
        ]
      }
    ];
    this.pieChartLabels = ['Total Incompleted', 'Total Complete'];
    this.pieChartData = [totalIncompleted, totalCompleted];
    this.pieChartType = 'pie';
    this.pieChartLegend = true;
    this.pieChartPlugins = [];
  }

  getCourseReportsDataCsv()
  {this.arrrayCourseReports = [];
    this.courseBatchesData.forEach(item => {
    var reportsData: any = [];
    reportsData.CourseName = item.name;
    reportsData.CourseID = item.identifier;
    reportsData.BatchName = item.batchName;
    reportsData.BatchId = item.batchId;
    reportsData.LessonCount = '0';
    reportsData.UsersEnrolled = item.totalEnrolled;
    reportsData.UsersCompleted = item.totalCompleted;

    this.arrrayCourseReports.push(reportsData);      
    });

    this.coursesSummaryCourses.downloadFile(this.arrrayCourseReports, 'course-report');
  }

  trimCourseLabels(courseLbls): string[]{
    let lengthLimit = 25;
    let trimmedCourseLabels : string[] =[];
    courseLbls.forEach(function (name) {
      let trimmedString = name.length > lengthLimit ?
          name.substring(0, lengthLimit - 3).concat("...") : name ;
      trimmedCourseLabels.push(trimmedString);
    })
    return trimmedCourseLabels;
  }

}
