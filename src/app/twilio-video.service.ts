import { Injectable, ElementRef, Renderer2, RendererFactory2 } from '@angular/core';
import { connect, RemoteParticipant, RemoteTrack, Room, RemoteTrackPublication, LocalTrack, LocalVideoTrack } from 'twilio-video';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TwilioService {
  public roomObj: Room | null = null;
  public roomParticipants: Map<string, RemoteParticipant> = new Map();
  public proctoringActive: boolean = false;

  private renderer: Renderer2;

  constructor(
    private http: HttpClient,
    private router: Router,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  connectToRoom(accessToken: string, options: any, localVideo: ElementRef, remoteVideo: ElementRef, userName:string): void {
    connect(accessToken, options).then(room => {
      console.log("Connected to Twilio Room:", room);
      this.roomObj = room;

      // Start local video if video option is enabled
      if (this.roomObj && options['video']) {
        this.startLocalVideo(localVideo, userName);
      }

      // Handle participant events
      this.roomObj.on('participantConnected', (participant: RemoteParticipant) => {
        if (this.roomObj) {
          console.log("Local participant connected:", this.roomObj.localParticipant);
        }
        console.log("Participant connected:", participant);
        console.log("Remote participant connected:", participant);
        this.roomParticipants.set(participant.sid, participant);
        this.attachParticipantTracks(participant, remoteVideo);
      });

      this.roomObj.on('participantDisconnected', (participant: RemoteParticipant) => {
        console.log("Participant disconnected:", participant);
        this.roomParticipants.delete(participant.sid);
        this.detachTracks(participant, remoteVideo);
      });

      this.roomObj.on('disconnected', () => {
        console.log("Disconnected from Twilio Room");
        this.detachAllTracks(remoteVideo);
        this.router.navigate(['thanks']);
      });

    }).catch(error => {
      alert(error.message);
    });
  }

  startLocalVideo(localVideo: ElementRef, userName: string): void {
    if (this.roomObj) {
      this.roomObj.localParticipant.videoTracks.forEach(publication => {
        console.log("Local video publication:", publication);
        const element = publication.track.attach();
        console.log("Local video track attached:", element);
        this.renderer.setStyle(element, 'width', '25%');
        this.renderer.setAttribute(element, 'title', userName); // Set user's name as title attribute
        this.renderer.appendChild(localVideo.nativeElement, element);
      });
    }
  }
  

  startScreenSharing(): Promise<void> {
    return navigator.mediaDevices.getDisplayMedia().then(stream => {
      const track = new LocalVideoTrack(stream.getTracks()[0]);
      if (this.roomObj) {
        this.roomObj.localParticipant.publishTrack(track);
      }
    }).catch(error => {
      console.error('Error accessing screen sharing:', error);
    });
  }

  startProctoring(): void {
    this.proctoringActive = true;
  }

  stopProctoring(): void {
    this.proctoringActive = false;
  }

  attachParticipantTracks(participant: RemoteParticipant, remoteVideo: ElementRef): void {
    console.log("🚀 ~ TwilioService ~ attachParticipantTracks ~ remoteVideo:", remoteVideo)
    console.log("Attaching tracks for participant:", participant);
    participant.tracks.forEach(publication => {
      this.trackPublished(publication, remoteVideo);
    });
  }

  trackPublished(publication: RemoteTrackPublication, remoteVideo: ElementRef) {
    console.log("🚀 ~ TwilioService ~ trackPublished ~ publication:", publication)
    console.log("Track published:", publication);
    if (publication.isSubscribed) {
      console.log("🚀 ~ TwilioService ~ trackPublished ~ publication.isSubscribed:", publication.isSubscribed)
      this.attachTracks(publication.track, remoteVideo);
    } else {
      publication.on('subscribed', (track: RemoteTrackPublication) => {
        this.attachTracks(track.track, remoteVideo);
      });
    }
  }

  attachTracks(track: LocalTrack | RemoteTrack | null, videoElement: ElementRef): void {
    console.log("🚀 ~ TwilioService ~ attachTracks ~ videoElement:", videoElement)
    console.log("🚀 ~ TwilioService ~ attachTracks ~ track:", track)
    if (track instanceof LocalVideoTrack  || (track && 'attach' in track)) {
      const element = track.attach();
      console.log("🚀 ~ TwilioService ~ attachTracks ~ element:", element)
      this.renderer.setStyle(element, 'height', '100%');
      this.renderer.setStyle(element, 'max-width', '100%');
      this.renderer.appendChild(videoElement.nativeElement, element);
    } else {
      console.error('Invalid track type or null, cannot attach.');
    }
  }

  detachTracks(participant: RemoteParticipant, remoteVideo: ElementRef): void {
    console.log("Detaching tracks for participant:", participant);
    participant.tracks.forEach(publication => {
      let element = remoteVideo.nativeElement;
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    });
  }

  detachAllTracks(videoElement: ElementRef): void {
    console.log("Detaching all tracks");
    let element = videoElement.nativeElement;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}
