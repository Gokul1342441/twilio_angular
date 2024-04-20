import { Component, ElementRef, ViewChild } from '@angular/core';
// import { TwilioVideoService } from './twilio-video.service';
import { TwilioService } from './twilio-video.service';
import { LocalVideoTrack } from 'twilio-video';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  public token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzQyMWQwMGUyNzRhYjY5NjcyMzk1NzYzZmQ4YzhmZjBhLTE3MTM2MjYwNjIiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJHT0tVTCBSQUogIEsgViIsInZpZGVvIjp7InJvb20iOiJjMDgwZDYyMy0zNTI1LTRkMjQtOWJjYS04YjBmMDE0NTM0OGFfYmJkYmRkNzgtMWI0YS00YTRlLWJkNzUtNzU1N2UzZWZjMDM0XzUzZDgzMzY2LTI0ZjEtNGJjOS05MjI5LTQ2MDQ4MWQ1NzY4NSJ9fSwiaWF0IjoxNzEzNjI2MDYyLCJleHAiOjE3MTM2Mjk2NjIsImlzcyI6IlNLNDIxZDAwZTI3NGFiNjk2NzIzOTU3NjNmZDhjOGZmMGEiLCJzdWIiOiJBQ2U3ZWFhOTkyOGUwYTcwYzU3MGFmMGVkNTQ4MDZjMWNmIn0.YULW_gC38-KulbRvFZ9su0KiUJKE8NBA01Mox4ICgmM'; // Replace with your JWT token
  public roomName = 'c080d623-3525-4d24-9bca-8b0f0145348a_bbdbdd78-1b4a-4a4e-bd75-7557e3efc034_53d83366-24f1-4bc9-9229-460481d57685'; // Replace with your room name
  @ViewChild('remoteVideo', { static: true }) remoteVideo!: ElementRef;
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef;

  constructor(private twilioService: TwilioService) { }

  ngOnInit(): void {
    this.initiateVideoCall();
  }

  initiateVideoCall(): void {
    const accessToken = this.token;
    const options = {
      video: true,
      audio: true,
      name: this.roomName,
    };

    this.twilioService.connectToRoom(accessToken, options, this.localVideo, this.remoteVideo);
  }

  

}