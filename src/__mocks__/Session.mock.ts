import { createAudioMediaStreamTrackMock, createVideoMediaStreamTrackMock } from 'webrtc-mock';
import type { IncomingInfoEvent } from '@krivega/jssip/lib/RTCSession';
import RTCPeerConnectionMock from './RTCPeerConnectionMock';
import BaseSession from './BaseSession.mock';

const CONNECTION_DELAY = 400; // more 300 for test cancel requests with debounced

export const FAILED_CONFERENCE_NUMBER = '777';

/* eslint-disable class-methods-use-this */

class Session extends BaseSession {
  url: string;

  status_code?: number;

  constructor({
    url = '',
    mediaStream,
    eventHandlers,
    originator,
  }: {
    url?: string;
    mediaStream?: any;
    eventHandlers?: any;
    originator: string;
  }) {
    super({ originator, eventHandlers });
    this.url = url;
    this.initPeerconnection(mediaStream);
  }

  initPeerconnection(mediaStream: any) {
    if (!mediaStream) {
      return false;
    }

    this.createPeerconnection(mediaStream);

    setTimeout(() => {
      if (this.url.includes(FAILED_CONFERENCE_NUMBER)) {
        this.trigger('failed', {
          originator: 'remote',
          message: 'IncomingResponse',
          cause: 'Rejected',
        });
      } else {
        this.trigger('confirmed');
      }
    }, CONNECTION_DELAY);

    return true;
  }

  createPeerconnection(sendedStream: any) {
    const audioTrack = createAudioMediaStreamTrackMock();
    const videoTrack = createVideoMediaStreamTrackMock();

    audioTrack.id = 'mainaudio1';
    videoTrack.id = 'mainvideo1';

    this._connection = new RTCPeerConnectionMock([audioTrack, videoTrack]);

    this._addStream(sendedStream);

    setTimeout(() => {
      this.trigger('peerconnection', { peerconnection: this.connection });
    }, CONNECTION_DELAY);
  }

  /**
     * answer
     *
     * @param {Object} arg1               - The argument 1
     * @param {Object} arg1.mediaStream   - The media stream
     * @param {Array}  arg1.eventHandlers - The event handlers

 * @returns {undefined}
     */
  answer({ mediaStream, eventHandlers }) {
    if (this.originator !== 'remote') {
      const error = new Error('answer available only for remote sessions');

      throw error;
    }

    this.initEvents(eventHandlers);
    this.initPeerconnection(mediaStream);
  }

  // eslint-disable-next-line camelcase
  terminate({ status_code }: { status_code?: number } = {}) {
    // eslint-disable-next-line camelcase
    this.status_code = status_code;

    this.trigger('ended', { status_code });

    return this;
  }

  // eslint-disable-next-line camelcase
  terminateRemote({ status_code }: { status_code?: number } = {}) {
    // eslint-disable-next-line camelcase
    this.status_code = status_code;

    this.trigger('ended', { status_code, originator: 'remote' });

    return this;
  }

  _addStream(stream: { [x: string]: () => any[] }, action = 'getTracks') {
    stream[action]().forEach((track: MediaStreamTrack) => {
      return this.connection!.addTrack(track);
    });
  }

  _forEachSenders(callback: {
    ({ track }: { track: any }): void;
    ({ track }: { track: any }): void;
    (arg0: any): void;
  }) {
    const senders = this.connection!.getSenders();

    for (const sender of senders) {
      callback(sender);
    }

    return senders;
  }

  /* eslint-disable no-param-reassign */

  _toggleMuteAudio(mute: boolean) {
    this._forEachSenders(({ track }) => {
      if (track && track.kind === 'audio') {
        track.enabled = !mute;
      }
    });
  }
  /* eslint-enable no-param-reassign */

  /* eslint-disable no-param-reassign */

  _toggleMuteVideo(mute: boolean) {
    this._forEachSenders(({ track }) => {
      if (track && track.kind === 'video') {
        track.enabled = !mute;
      }
    });
  }

  mute(options: { audio: any; video: any }) {
    if (options.audio) {
      this._mutedOptions.audio = true;
      this._toggleMuteAudio(this._mutedOptions.audio);
    }

    if (options.video) {
      this._mutedOptions.video = true;
      this._toggleMuteVideo(this._mutedOptions.video);
    }

    this._onmute(options);
  }

  unmute(options: { audio: any; video: any }) {
    if (options.audio) {
      this._mutedOptions.audio = false;
    }

    if (options.video) {
      this._mutedOptions.video = false;
    }

    this.trigger('unmuted', options);
  }

  isMuted() {
    return this._mutedOptions;
  }

  replaceMediaStream(mediaStream: any) {
    return Promise.resolve(mediaStream);
  }

  _onmute({ audio, video }: { audio: boolean; video: boolean }) {
    this.trigger('muted', {
      audio,
      video,
    });
  }

  sendInfo() {
    return undefined;
  }

  newInfo(data: IncomingInfoEvent) {
    this.trigger('newInfo', data);
  }
  /* eslint-enable no-param-reassign */
}

export default Session;
