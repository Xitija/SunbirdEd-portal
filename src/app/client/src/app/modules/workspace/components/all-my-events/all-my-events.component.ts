
import{ UserService }from '@sunbird/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {EventListService} from 'ngtek-event-library';
// import { EventCreateService } from 'ngtek-event-library';
// import { EventDetailService } from 'ngtek-event-library';
import { EventFilterService } from 'ngtek-event-library';
import { from } from 'rxjs';
import {ToasterService}from '@sunbird/shared';
import { createDirective } from '@angular/compiler/src/core';
const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  yellow: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
};

@Component({
  selector: 'app-all-my-events',
  templateUrl: './all-my-events.component.html',
  styleUrls: ['./all-my-events.component.scss']
})
export class AllMyEventsComponent implements OnInit {

  eventList : any;
  // eventItem: any;
  // tab :string= "list";
  // userId: any = "1001";
  // formFieldProperties: any;
  filterConfig: any;
  isLoading: boolean =  true;
  myEvents: any[];
  // p: number = 1;
  // collection: any[];
  Filterdata: any; 
  libEventConfig:any; 
  dates: any;
  EventListCount: any;
  query: any;
  today = new Date();
  sort_by: any;
  todayDate = this.today.getFullYear() + '-' + ('0' + (this.today.getMonth() + 1)).slice(-2) + '-' + ('0' + (this.today.getDate())).slice(-2);
  yesterdayDate = this.today.getFullYear() + '-' + ('0' + (this.today.getMonth() + 1)).slice(-2) + '-' + ('0' + (this.today.getDate()-1)).slice(-2);
  tommorrowDate = this.today.getFullYear() + '-' + ('0' + (this.today.getMonth() + 1)).slice(-2) + '-' + ('0' + (this.today.getDate()+1)).slice(-2);

  constructor( 
     private eventListService:EventListService,
    // private eventCreateService: EventCreateService,
    // private eventDetailService: EventDetailService,
    private router: Router,
    public userService: UserService,
    private eventFilterService: EventFilterService,
    private toasterService: ToasterService
    ) {
    
   }

  ngOnInit() {
    this.showEventListPage();
    this.showFilters();
    // this.showMyEventListPage();
  }

  /**
   * For get List of events
   */
   showEventListPage(){
    this.Filterdata = {
      "status":[],
      "objectType": "Event",
      "owner":this.userService.userid
      };
    this.eventListService.getEventList( this.Filterdata).subscribe((data:any)=>{
       this.eventList = data.result?.Event;
       this.EventListCount= data.result?.count;

       this.eventList.forEach((item, index) => {

        var array = JSON.parse("[" + item.venue + "]");
        this.eventList[index].venue = array[0].name;
    });
      
      this.isLoading = false;
    },err=>{console.log("err",err);}
    )
  }


  /**
   * For subscibe click action on event card
   */
   navToEventDetail(event){
    this.router.navigate(['workspace/add/event'], {
      queryParams: {
        identifier: event.identifier
      }
    });
  }

  showFilters() {
    this.eventListService.getMyEventsFilterFormConfig().subscribe((data: any) => {
      this.filterConfig = data.result['form'].data.fields;
      this.isLoading = false;

      console.log('eventfilters = ',data.result['form'].data.fields);
    },
    (err: any) => {
      console.log('err = ', err);
    });
  }

  setEventConfig() {
    this.libEventConfig = {
      context: {
        user:this.userService.userProfile,
        identifier: '',
        channel: this.userService.channel,
        authToken: '',
        sid: this.userService.sessionId,
        uid: this.userService.userid,
        additionalCategories: 'additionalCategories',
      },
      config: {
        mode: 'list'
      }
    };
 }

 getFilteredData(event)
  {
    if(event.search)
    {
      this.Filterdata ={
        "status":[],
        "objectType": "Event",
      };
      this.query=event.target.value;
    }
    else if((event.filtersSelected.eventTime) && (event.filtersSelected.eventType) && (event.filtersSelected.eventStatus))
    {
      switch (event.filtersSelected.eventTime) {
        case "Past":
          this.dates={ 
            "max": this.todayDate
          }
            break;
        case "Upcoming":
          this.dates={ 
            "min": this.todayDate
          }
            break;
        default:
          this.dates={ 
            "max": this.todayDate
          }
              break;
      } 
      this.Filterdata ={
        "status":event.filtersSelected.eventStatus,
        "eventType" :event.filtersSelected.eventType,
        "startDate":this.dates,
        "objectType": "Event"
      };
    }
    else if((event.filtersSelected.eventTime) && (event.filtersSelected.eventType))
    {
      switch (event.filtersSelected.eventTime) {
        case "Past":
          this.dates={ 
            "max": this.todayDate
          }
            break;
        case "Upcoming":
          this.dates={ 
            "min": this.todayDate
          }
            break;
        default:
          this.dates={ 
            "max": this.todayDate
          }
              break;
      } 
      this.Filterdata ={
        "status":[],
        "eventType" :event.filtersSelected.eventType,
        "startDate":this.dates,
        "objectType": "Event",
        "owner":this.userService.userid
      };
    }
    else if((event.filtersSelected.eventTime) && (event.filtersSelected.eventStatus))
    {
      switch (event.filtersSelected.eventTime) {
        case "Past":
          this.dates={ 
            "max": this.todayDate
          }
            break;
        case "Upcoming":
          this.dates={ 
            "min": this.todayDate
          }
            break;
        default:
          this.dates={ 
            "max": this.todayDate
          }
              break;
      } 
      this.Filterdata ={
        "status":event.filtersSelected.eventStatus,
        "startDate":this.dates,
        "objectType": "Event"
      };
    }
    else if((event.filtersSelected.eventType) && (event.filtersSelected.eventStatus))
    {     
      this.Filterdata ={
        "status":event.filtersSelected.eventStatus,
        "eventType" :event.filtersSelected.eventType,
        "objectType": "Event"
      };
    }
    else if(event.filtersSelected.eventType)
    {
        this.Filterdata ={
          "status":[],
          "eventType" :event.filtersSelected.eventType,
          "objectType": "Event",
          "owner":this.userService.userid
        };
    }
    else if(event.filtersSelected.eventStatus)
    {
        this.Filterdata ={
          "status":event.filtersSelected.eventStatus,
          "objectType": "Event"
        };
    }
    else if(event.filtersSelected.eventTime)
    { 
        switch (event.filtersSelected.eventTime) {
          case "Past":
            this.dates={ 
              "max": this.todayDate
            }
              break;
          case "Upcoming":
            this.dates={ 
              "min": this.todayDate
            }
              break;
          default:
            this.dates={ 
              "max": this.todayDate
            }
          break;
        } 
        this.Filterdata ={
          "status":[],
          "startDate" :this.dates,
          "objectType": "Event",
          "owner":this.userService.userid
        };
    }
    else
    {
      this.Filterdata ={
        "status":[],
        "objectType": "Event",
        "owner":this.userService.userid
      };
    }
    var tempEventListData: any = [];
    this.eventListService.getEventList(this.Filterdata,this.query).subscribe((data) => {
      if (data.responseCode == "OK") 
        {
          this.isLoading=false;
          delete this.eventList;

          let tempEventList: any = data.result.Event;
          var temp1: any;
          var temp2: any;
          for (var k in tempEventList) {
            temp1 = tempEventList[k].endDate;
            temp2 = tempEventList[k].endTime;
            var tempFilterData = temp1 + " " + temp2;
  
            var dTime = new Date();
            var dateTime: any;
            dateTime = this.todayDate + " " + dTime.toLocaleTimeString() + "+05:30";
  
            if (event.filtersSelected == undefined) {
              tempEventListData = tempEventList;
            } else if (event.filtersSelected.eventTime) {
              switch (event.filtersSelected.eventTime) {
                case "Past":
                  if (tempFilterData < dateTime) {
                    tempEventListData.push(tempEventList[k]);
                  }
                  break;
  
                case "Upcoming":
                  var timeTemp :any = dTime.toLocaleTimeString() + "+05:30";
                    if( tempEventList[k].startDate >= this.todayDate && tempEventList[k].startDate+"-"+tempEventList[k].startTime > this.todayDate+"-"+timeTemp){
                      tempEventListData.push(tempEventList[k]);
                    }
                  break;
  
                default:
                  var timeTemp :any = dTime.toLocaleTimeString() + "+05:30";
                  //console.log("this.todayDate :: "+this.todayDate);
                  if( tempEventList[k].endDate >= this.todayDate && tempEventList[k].startDate+"-"+tempEventList[k].startTime < this.todayDate+"-"+timeTemp
                  && tempEventList[k].endDate+"-"+tempEventList[k].endTime >= this.todayDate+"-"+timeTemp){
                    tempEventListData.push(tempEventList[k]);
                  }
                  break;
              }
            } else {
              tempEventListData = tempEventList;
            }
          }

          this.EventListCount= data.result?.count;
          this.eventList = tempEventListData;
          this.eventList.forEach((item, index) => {

            var array = JSON.parse("[" + item.venue + "]");
            this.eventList[index].venue = array[0].name;

          });
         
        }
      }, (err) => {
        this.isLoading=false;
        this.toasterService.error(err.error.result.messages[0]);
     
      });
  }

 sortData(event){
  this.sort_by = {[event.filterStatus[0].sort_by]:event.filterStatus[0].SortType ? 'desc' : 'asc'};

    this.eventListService.getEventList(this.Filterdata,'', this.sort_by).subscribe((data:any)=>{
      this.eventList = data.result?.Event;
      this.EventListCount= data.result?.count;
      this.eventList.forEach((item, index) => 
      {

        var array = JSON.parse("[" + item.venue + "]");
        this.eventList[index].venue = array[0].name;
      });

     this.isLoading = false;
   },err=>{console.log("err",err);}
   )
  }

}
